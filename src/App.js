import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import { IconButton } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import ListOfMenuItems from './scripts/courses.json';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Courses from './courseTable.js';
import Calendar from './calendar.js';


class App extends Component {
  constructor() {
    super();
    this.state =
      {
        units: [],
        degrees: [],
        periods: [],
        drawerOpen: false,
        started: false,
        calendar: false,
        selectedCourses: []
      };

  }
  initializeStates = () => {
    var unitArray = [];
    var degreeArray = [];
    var periodArray = [];
    for (var i = 0; i < ListOfMenuItems.units.length; i++) {
      unitArray.push(false);
    }
    for (i = 0; i < ListOfMenuItems.degree.length; i++) {
      degreeArray.push(false);
    }
    for (i = 0; i < ListOfMenuItems.periods.length; i++) {
      periodArray.push(false);
    }
    this.setState({
      units: unitArray,
      degrees: degreeArray,
      periods: periodArray
    });
  }
  componentDidMount() {
    this.initializeStates();
  }

  controlDrawer = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen })
  }
  handlechange = (e, desiredState) => {
    console.time("TimeToUpdate");
    if (desiredState === "units") {
      var updated = [...this.state.units];
    }
    else if (desiredState === "periods") {
      var updated = [...this.state.periods];
    }
    else if (desiredState === "degrees") {
      var updated = [...this.state.degrees];
    }

    updated[e] = !updated[e];
    this.setState({
      [desiredState]: updated
    });
    console.timeEnd("TimeToUpdate");
  }
  startSearch = () =>
  {
    this.setState({started: true,drawerOpen: false,calendar: false});
    this.forceUpdate();
  }
  courseConfirmation = (courses) => 
  {
    console.log(courses,"Varmistus");
    this.setState({
      calendar: true,
      started:false,
      selectedCourses: courses
    });
  }
  render() {
    console.log(this.state.units[0]);
    const sendButton = [];
    const courses = [];
    const calendar = [];
    if(!this.state.started)
    {
      sendButton.push(<Button
        variant="contained"
        color="primary"
        style={{ margin: '50px 20px 0px 20px' }}
        onClick={(e, v) => { this.startSearch()}}>
        LÄHETÄ
          </Button>);
    }
    else
    {
      courses.push(<Courses
        selectedCourse={this.courseConfirmation}
        units={this.state.units}
        degrees={this.state.degrees}
        periods={this.state.periods}
        started={this.state.started}
      />);
    }
    if(this.state.calendar)
    {
      calendar.push(<Calendar
      data={this.state.selectedCourses}
      />)
    }
    const appBarContains = [
      <Drawer
        open={this.state.drawerOpen}
        onClose={(e, v) => { this.setState({drawerOpen: false}) }}>
        <h2>Tiedekunnat</h2>
        <FormGroup column>
          {ListOfMenuItems.units.map((text, index) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.units[index]}
                  onChange={(e, v) => { this.handlechange(index, "units") }}
                  value={text} />
              }
              label={text} />
          ))}
        </FormGroup>
        <Divider />
        <h2>Periodit</h2>
        <FormGroup column>
          {ListOfMenuItems.periods.map((text, index) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.periods[index]}
                  onChange={(e, v) => { this.handlechange(index, "periods") }}
                  value={index - 1}
                />
              }
              label={index + 1 + ". Periodi"} />
          ))}
        </FormGroup>
        <Divider />
        <h2>Tutkinto-Ohjelmat</h2>
        <div style={{ height: "200px", overflowY: "scroll" }}>
          <FormGroup column>
            {ListOfMenuItems.degree.map((text, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.degrees[index]}
                    onChange={(e, v) => { this.handlechange(index, "degrees") }}
                    value={text} />
                }
                label={text} />
            ))}
          </FormGroup>
        </div>
        {sendButton}
      </Drawer>



    ];

    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon onClick={(e, v) => { this.controlDrawer() }} />
            </IconButton>
          </Toolbar>
        </AppBar>
        {appBarContains}
        {courses}
        {calendar}
      </div>
    );
  }
}
export default App;
