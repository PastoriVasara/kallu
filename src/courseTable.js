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


const styles = theme => ({
    icon: {
        position: "relative",   
        top: theme.spacing.unit,
        width: theme.typography.display1.fontSize,
        height: theme.typography.display1.fontSize
    }
});

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
    componentDidMount() {
        this.updateCourses();
    }
    checkProperties(previousProperties, properties) {
        return (previousProperties.degrees != properties.degrees
            || previousProperties.periods != properties.periods
            || previousProperties.units != properties.units
            || previousProperties.started != properties.started)
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.started && this.checkProperties(prevProps, this.props)) {

            this.updateCourses();

        }
    }
    coursesIntoObject() {
        console.time("TurnIntoObjects");

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
        console.timeEnd("TurnIntoObjects");
        return contentList
    }

    updateCourses() {
        var givenData = this.coursesIntoObject();
        var updatedData = "";;

        console.time("Fetch");
        $.ajax({
            type: 'POST',
            //url: "https://request.kallu.fi/call.php",
            url: "http://localhost/phpCall/call.php",
            data: givenData,
            success: function (givenData) {
                var returnedData = givenData;
                updatedData = returnedData;
            },
            contentsType: 'json',
            async: false,
            error: function (x, e) {
                console.log(givenData);
                console.log(Object.keys(x));
                console.log("CODE " + x.status + " Error: " + e);
            }

        });
        console.timeEnd("Fetch");
        console.log(updatedData);
        this.setState({
            courses: updatedData,
            selectedCourses: new Array(updatedData.length).fill('')
        });
        this.forceUpdate();
    }
    sortColumns = (columnName) => {
        var orderedCourses = [...this.state.courses];
        var order = 1;
        var count = this.state.sortState;
        console.log(count);
        if (columnName === this.state.latestSort) {
            if (count === 1) {
                console.log(count);
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
        console.log(count);
        orderedCourses.sort((a, b) => (a[columnName] > b[columnName]) ? 1 * order : -1 * order);
        this.setState({
            courses: orderedCourses,
            latestSort: columnName,
            sortState: count,
            page: 0
        });
    }
    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };
    updateSelectedCourses = (courseID, rowID) => {
        var updateSelection = [...this.state.selectedCourses];
        updateSelection[rowID] === '' ? updateSelection[rowID] = courseID : updateSelection[rowID] = '';
        this.setState({
            selectedCourses: updateSelection
        });
        this.forceUpdate();
    }
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
        console.time("turnIntoTable");
        const tableContents = [];
        if (this.state.courses.length > 0) {
            tableContents.push(
                <div>
                    <Table >
                        <div style={{ marginTop: '7vh', overflow: 'auto', height: '75vh' }}>
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
                        style={{ margin: '50px 20px 0px 20px' }}
                        onClick={(e, v) => { this.filterSelected() }}>
                        LÄHETÄ
                </Button>
                </div>
            );
        }
        console.timeEnd("turnIntoTable");
        return (
            <div>
                {tableContents}

            </div>
        );


    }

}
export default courseTable;
