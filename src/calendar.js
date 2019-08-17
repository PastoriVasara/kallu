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
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './main.scss';
import colorHelpers from './scripts/courseColors.json';
import styles from './App.css';


class Calendar extends Component {
    constructor() {
        super();

        this.state =
            {
                courses: [],
                lectures: []
            };

    }
    calendarComponentRef = React.createRef();
    setCourses = () => {
        this.setState({
            courses: this.props.data
        });
    }
    ajaxTheCourses = () => {
        Date.prototype.addHours = function (h) {
            this.setHours(this.getHours() + h);
            return this;
        }

        var givenData =
        {
            courseSchedule: this.props.data
        }
        var updatedData = "";
        $.ajax({
            type: 'POST',
            url: "http://localhost/phpCall/call.php",
            //url: "https://request.kallu.fi/call.php",
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
        console.log(updatedData);
        if(updatedData.length > 0){
        var currentID = updatedData[0].ID;
        var currentGROUP = updatedData[0].LECTURETYPE;
        var courseIterator = 0;
        var groupIterator = 0;

        var courseParent = [{
            courseName: updatedData[0].NAME,
            active: true,
            courseGroups: [{
                groupName: updatedData[0].TYPENAME,
                active: true,
                groupSessions: []
            }]
        }];

        for (var i = 0; i < updatedData.length; i++) {
            var lecture = { ...updatedData[i] };
            if (lecture.LECTURETYPE !== currentGROUP && lecture.ID === currentID) {
                groupIterator = 1;
                currentGROUP = lecture.LECTURETYPE;
                courseParent[courseParent.length - 1].courseGroups.push({
                    groupName: lecture.TYPENAME,
                    active: true,
                    groupSessions: []
                });
            }
            else {
                groupIterator++;
            }
            if (lecture.ID !== currentID) {
                courseIterator++;
                currentID = lecture.ID;
                groupIterator = 1;
                currentGROUP = lecture.LECTURETYPE;

                courseParent.push({
                    courseName: lecture.NAME,
                    active: true,
                    courseGroups: [{
                        groupName: lecture.TYPENAME,
                        active: true,
                        groupSessions: []
                    }]
                });
            }

            var lectureStart = new Date(lecture.STARTTIME);
            lectureStart.addHours((parseInt(lecture.STARTHOUR, 10) - 3));
            var lectureEnd = new Date(lecture.STARTTIME);
            lectureEnd.addHours((parseInt(lecture.ENDHOUR, 10) - 3));
            var lectureType = parseInt(lecture.LECTURETYPE, 10);
            var lectureModifier = this.checkLectureTypes(lectureType);
            var shadedColor = this.checkCorrectColor(colorHelpers[courseIterator % 4], lectureModifier, groupIterator);
            var datesOfSingleType =
            {
                name: lecture.NAME,
                group: lecture.TYPENAME,
                location: lecture.LOCATION,
                color: shadedColor,
                id: lecture.ID + "_" + lecture.LECTURETYPE + "_" + i,
                checked: true,
                singleCounts: []
            };

            if (lecture.REPEATING === "1") {
                var repeatingCycle = true;
                var cycle = 0;
                while (repeatingCycle) {
                    var startTime = new Date(lecture.STARTTIME);
                    startTime.addHours((parseInt(lecture.STARTHOUR, 10) - 3 + 7 * 24 * cycle));
                    var endTime = new Date(lecture.STARTTIME);
                    endTime.addHours((parseInt(lecture.ENDHOUR, 10) - 3 + 7 * 24 * cycle));
                    if (startTime < new Date(lecture.END)) {
                        datesOfSingleType.singleCounts.push({
                            color: shadedColor,
                            id: lecture.ID + "_" + lecture.LECTURETYPE + "_" + i,
                            title: lecture.NAME + "\n" + lecture.TYPENAME,
                            start: startTime,
                            end: endTime
                        });
                        cycle++;
                    }
                    else {
                        repeatingCycle = false;
                    }
                }
            }
            else {
                datesOfSingleType.singleCounts.push({
                    color: shadedColor,
                    id: lecture.ID + "_" + lecture.LECTURETYPE + "_" + i,
                    title: lecture.NAME + "\n" + lecture.TYPENAME,
                    start: lectureStart,
                    end: lectureEnd
                });
            }
            var shorthand = courseParent[courseParent.length - 1].courseGroups;
            shorthand[shorthand.length - 1].groupSessions.push(datesOfSingleType);
        }
        
        console.log(courseParent);
        this.setState({
            lectures: courseParent
        });
        }
    }
    checkLectureTypes = (givenType) => {
        var modifier = 1;

        //Types

        //Luento-opetus
        if (givenType === 1) {
            modifier = 0.3
        }
        //Pienryhmäopetus
        if (givenType === 2) {
            modifier = 0.4
        }
        //Yksilöopetus
        if (givenType === 3) {
            modifier = 0.5

        }
        //Ryhmätyöskentely
        if (givenType === 4) {
            modifier = -0.2
        }
        //Itsenäinen Työskentely
        if (givenType === 5) {
            modifier = -0.1
        }
        //Seminaari
        if (givenType === 6) {
            modifier = -0.4
        }
        //Harjoitukset
        if (givenType === 7) {
            modifier = -0.3
        }
        //Lukupiiri
        if (givenType === 8) {
            modifier = 0.7
        }
        //Kirjatentti
        if (givenType === 9) {
            modifier = 0.1
        }

        return modifier

    }

    checkCorrectColor = (baselineColor, modifier, iteration) => {
        var addedAmount = Math.ceil(255 * modifier);
        var redAmount = this.colorAddingFilter(baselineColor.Red, addedAmount, iteration);
        var greenAmount = this.colorAddingFilter(baselineColor.Green, addedAmount, iteration);;
        var blueAmount = this.colorAddingFilter(baselineColor.Blue, addedAmount, iteration);;

        return "rgb(" + redAmount + "," + greenAmount + "," + blueAmount + ")";
    }
    colorAddingFilter = (amount, addedAmount, iteration) => {
        var currentAmount = iteration === 1 ? 0 : iteration;
        return (amount + addedAmount < 0 || amount + addedAmount > 255) ? (amount + currentAmount < 255 ? amount + ((currentAmount % 5) * 20) : amount) : amount + addedAmount;
    }

    componentDidMount() {
        this.ajaxTheCourses();
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.courses != prevProps.courses) {
            this.ajaxTheCourses();
        }
    }
    updateGroups = (currentIteration, groupIteration, sessionIteration) => {
        var allLectures = [...this.state.lectures];

        allLectures[currentIteration].courseGroups[groupIteration].groupSessions[sessionIteration].checked = !allLectures[currentIteration].courseGroups[groupIteration].groupSessions[sessionIteration].checked;
        this.setState({
            lectures: allLectures
        });

    }
    collapseCourses(currentIteration) {
        console.log("ping");
        var allLectures = [...this.state.lectures];
        console.log(allLectures[currentIteration].active);
        allLectures[currentIteration].active = !allLectures[currentIteration].active;
        console.log(allLectures[currentIteration].active);
        this.setState({
            lectures: allLectures
        });
    }
    collapseGroups(currentIteration, currentGroupIteration) {
        var allLectures = [...this.state.lectures];
        allLectures[currentIteration].courseGroups[currentGroupIteration].active = !allLectures[currentIteration].courseGroups[currentGroupIteration].active;
        this.setState({
            lectures: allLectures
        });
    }
    render() {


        var selectedLectureTypes = [];
        var renderedLectureTypes = [];
        console.log(this.state.lectures);
        selectedLectureTypes.push
            (
                <div>
                    {this.state.lectures.map((checked, index) => (
                        <div>
                            <div
                                onClick={(e, v) => { this.collapseCourses(index) }}
                                style={{ display: 'flex', textTransform: 'uppercase', fontSize: '24px', backgroundColor: '#af662a', margin: '10px' }}>
                                <div style={{ marginLeft: '25px' }}>
                                    {this.state.lectures[index].active ? '-' : '+'}
                                </div>
                                <div style={{ marginLeft: '25px' }}>
                                    {this.state.lectures[index].courseName}
                                </div>
                            </div>
                            {this.state.lectures[index].courseGroups.map((notUsed, groupIndex) => (
                                <div style={this.state.lectures[index].active ? { display: 'block' } : { display: 'none' }}>
                                    <div
                                        onClick={(e, v) => { this.collapseGroups(index, groupIndex) }}
                                        style={{ display: 'flex', textTransform: 'uppercase', fontSize: '20px', backgroundColor: '#fa923d', margin: '15px' }}>

                                        <div style={{ marginLeft: '25px' }}>
                                            {this.state.lectures[index].courseGroups[groupIndex].active ? '-' : '+'}
                                        </div>
                                        <div style={{ marginLeft: '50px' }}>
                                            {this.state.lectures[index].courseGroups[groupIndex].groupName}
                                        </div>
                                    </div>
                                    {this.state.lectures[index].courseGroups[groupIndex].groupSessions.map((stillnoUse, sessionIndex) => (
                                        <div style={this.state.lectures[index].courseGroups[groupIndex].active ? { display: 'block' } : { display: 'none' }}>
                                            <div style={{ backgroundColor: '#d3d3d3', margin: '10px 20px 10px 30px', borderRadius: '10px', }}>
                                                <div style={{ justifyContent: 'left', alignItems: 'center', display: 'flex' }}>
                                                    <Checkbox
                                                        style={{ color: this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].color }}
                                                        checked={this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].checked}
                                                        onChange={(e, v) => { this.updateGroups(index, groupIndex, sessionIndex) }} />

                                                    <div style={{
                                                        height: '25px',
                                                        width: '25px',
                                                        backgroundColor: this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].color
                                                    }}>
                                                    </div>
                                                    <div style={{ textAlign: 'left', marginLeft: '9px' }}>
                                                        {this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].name} <br />
                                                        {this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].group} <br />
                                                        {this.state.lectures[index].courseGroups[groupIndex].groupSessions[sessionIndex].location}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ))}
                        </div>

                    ))}
                </div>
            );
        for (var i = 0; i < this.state.lectures.length; i++) {
            for (var j = 0; j < this.state.lectures[i].courseGroups.length; j++) {
                for (var g = 0; g < this.state.lectures[i].courseGroups[j].groupSessions.length; g++) {
                    if (this.state.lectures[i].courseGroups[j].groupSessions[g].checked) {
                        renderedLectureTypes = renderedLectureTypes.concat(this.state.lectures[i].courseGroups[j].groupSessions[g].singleCounts);
                    }
                }
            }

        }
        console.log(renderedLectureTypes);
        var calendar = [];
        if(this.state.lectures.length > 0)
        {
            calendar.push(
                <FullCalendar
                    ref={this.calendarComponentRef}
                    locale="fi"
                    contentHeight="auto"
                    defaultView="timeGridWeek"
                    slotDuration="00:30:00"
                    minTime="07:00:00"
                    maxTime="22:00:00"
                    eventTextColor="rgb(0,0,0)"
                    events={renderedLectureTypes}
                    header={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                    }}
                    allDaySlot={false}
                    weekends={false}
                    plugins={[dayGridPlugin, timeGridPlugin]}
                />
            );
        }
        else 
        {
            calendar.push(<div style={{top:'50vh',left:'50vh'}}>Valitsemallasi haulla ei löydy oppitunteja.</div>);
        }
        return (
            <div>
                <div style={{ height: '25vh', overflowY: 'scroll', marginBottom: '25px' }}>
                    {selectedLectureTypes}
                </div>
                {calendar}

            </div>
        );

    }

}
export default Calendar;