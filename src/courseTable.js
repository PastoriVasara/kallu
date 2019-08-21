import React, { Component } from 'react';
import $ from 'jquery';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ListOfMenuItems from './scripts/courses.json';
import { Checkbox } from '@material-ui/core';
import DownArrow from '@material-ui/icons/ArrowDropUp';
import UpArrow from '@material-ui/icons/ArrowDropDown';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

class courseTable extends Component {
    constructor() {
        super();
        this.state =
            {
                courses: [],
                latestSort: '',
                sortState: 1,
                selectedCourses: [],
                page: 0,
                rowsPerPage: 10
            };

    }
    //on mounting update the courses
    componentDidMount() {
        this.updateCourses();
    }
    //check if properties have changed
    checkProperties(previousProperties, properties) {
        return (previousProperties.degrees != properties.degrees
            || previousProperties.periods != properties.periods
            || previousProperties.units != properties.units
            || previousProperties.started != properties.started)
    }
    //on changing the properties update courses
    componentDidUpdate(prevProps, prevState) {
        if (this.props.started && this.checkProperties(prevProps, this.props)) {

            this.updateCourses();

        }
    }

    //turn an array of selections to a single object
    coursesIntoObject() {


        var periods = [];
        var degrees = [];
        var units = [];
        //check units
        for (var i = 0; i < this.props.units.length; i++) {
            if (this.props.units[i]) {
                units.push(ListOfMenuItems.unitAbb[i]);
            }
        }
        //check degrees
        for (i = 0; i < this.props.degrees.length; i++) {
            if (this.props.degrees[i]) {
                degrees.push(ListOfMenuItems.degree[i]);
            }
        }
        //check periods
        for (i = 0; i < this.props.periods.length; i++) {
            if (this.props.periods[i]) {
                periods.push(ListOfMenuItems.periods[i]);
            }
        }
        var contentList =
        {
            tablePeriods: periods,
            tableDegrees: degrees,
            tableUnits: units
        }
        return contentList
    }

    updateCourses() {
        var givenData = this.coursesIntoObject();
        var updatedData = "";;

        //fetch the selected courses from SQL server via jquery
        $.ajax({
            type: 'POST',
            url: "https://request.kallu.fi/call.php",
            //url: "http://localhost/phpCall/call.php",
            data: givenData,
            success: function (givenData) {
                var returnedData = givenData;
                updatedData = returnedData;
            },
            contentsType: 'json',
            async: false,
            error: function (x, e) {
                //debugging possible errors
                console.log(givenData);
                console.log(Object.keys(x));
                console.log("CODE " + x.status + " Error: " + e);
            }

        });

        this.setState({
            courses: updatedData,
            selectedCourses: new Array(updatedData.length).fill('')
        });
        this.forceUpdate();
    }
    //sort columns by clicking the selected column
    sortColumns = (columnName) => {
        var orderedCourses = [...this.state.courses];
        var order = 1;
        var count = this.state.sortState;
        if (columnName === this.state.latestSort) {
            if (count === 1) {
                order = -1;
                count = 2;
            }
            else {
                count = 1
            }
        }
        else {
            count = 1;
        }
        orderedCourses.sort((a, b) => (a[columnName] > b[columnName]) ? 1 * order : -1 * order);
        this.setState({
            courses: orderedCourses,
            latestSort: columnName,
            sortState: count,
            page: 0
        });
    }
    //change the page
    handleChangePage = (event, page) => {
        this.setState({ page });
    };
    //change the amount of rows for each page
    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    //update the selected course to be selected or not via clicking the checkbox
    updateSelectedCourses = (courseID, rowID) => {
        var updateSelection = [...this.state.selectedCourses];
        updateSelection[rowID] === '' ? updateSelection[rowID] = courseID : updateSelection[rowID] = '';
        this.setState({
            selectedCourses: updateSelection
        });
        this.forceUpdate();
    }
    //filter away all empty selections
    filterSelected = () => {
        
        var wantedCourses = [...this.state.selectedCourses ];
        wantedCourses = wantedCourses.filter(function (el)
        {
            return el != '';
        });
        if(wantedCourses.length > 0){
        this.props.selectedCourse(wantedCourses);
        }
    }
    render() {
        const tableContents = [];
        if (this.state.courses.length > 0) {
            tableContents.push(
                <div>
                    
                    <Table >
                        <div style={{ marginTop: '7vh', overflow: 'auto', height: '75vh' }}>
                        <Paper>
                            <TableHead>
                                <TableRow>
                                    <TableCell> <Typography>Check</Typography> </TableCell>
                                    {ListOfMenuItems.array.map((text, index) => (
                                        <TableCell
                                            style={{ width: '10%' }}
                                            key={text}
                                        > <div onClick={(e, v) => { this.sortColumns(text) }}> {
                                            this.state.latestSort === text ? (
                                                this.state.sortState === 1 ? (<Typography>{text}<UpArrow /></Typography>)
                                                    : <Grid container direction="row" alignItems="center"> <Grid item><Typography>{text}</Typography></Grid><Grid item><DownArrow /></Grid></Grid>
                                            ) : <Typography>{text}</Typography>
                                        }</div>

                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>

                                {this.state.courses.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                                    .map(row => (
                                        <TableRow>
                                            <TableCell>
                                                <Checkbox
                                                    checked={this.state.selectedCourses[parseInt(row.num,10)] === '' ? false : true}
                                                    onChange={(e, v) => { this.updateSelectedCourses(row.ID, parseInt(row.num,10)) }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.ID}</TableCell>
                                            <TableCell>{row.CODE}</TableCell>
                                            <TableCell>{row.UNIT}</TableCell>
                                            <TableCell>{row.DEGREE}</TableCell>
                                            <TableCell>{row.NAME}</TableCell>
                                            <TableCell>{row.START}</TableCell>
                                            <TableCell>{row.END}</TableCell>
                                            <TableCell>{row.LANG}</TableCell>
                                            <TableCell><a href={row.URL}>LINK</a></TableCell>
                                            <TableCell>{row.CREDITS}</TableCell>
                                            <TableCell>{row.PERIOD1}</TableCell>
                                            <TableCell>{row.PERIOD2}</TableCell>
                                            <TableCell>{row.PERIOD3}</TableCell>
                                            <TableCell>{row.PERIOD4}</TableCell>
                                        </TableRow>
                                    ))}

                            </TableBody>
                            </Paper>
                        </div>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    component="div"
                                    count={this.state.courses.length}
                                    rowsPerPage={this.state.rowsPerPage}
                                    page={this.state.page}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ margin: '0px 20px 0px 20px' }}
                        onClick={(e, v) => { this.filterSelected() }}>
                        LÄHETÄ
                </Button>
                </div>
            );
        }
        return (
            <div>
                {tableContents}
            </div>
        );


    }

}
export default courseTable;
