import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor'
import Modal from 'react-modal';
import { Tasks } from '../api/tasks.js';

import Datetime from 'react-datetime';
import moment from 'moment';

require('react-datepicker/dist/react-datepicker.css');

//Style for the modal
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

export default class TaskModal extends Component {

  constructor(props) {

    super(props);
 
    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  
  
  //Methods to handle close, after open and opening of the modal
  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  submitTask(){

    // Find the text field via the React ref
    let taskObj = {
      assignment: this.assignment.value.trim(),
      resources: this.resources.value.trim(),
      solutions: this.solutions.value.trim(),

      // deadline: this.deadline.value.trim(),
      // collaborators: this.collaborators.value.trim(),
    };

    // console.log(this.assignment.value, this.resources.value, this.solutions.value); //works

    Meteor.call('tasks.insert', taskObj);

    //closeModal();
 
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (<Modal
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeModal.bind(this)}
        style={customStyles}
        contentLabel="Example Modal"
      >

          <h2>Add a task</h2>

            <textarea
              ref={input => this.assignment = input}
              placeholder="Type to add assignment"
            />
            
            <textarea
              ref={input => this.resources = input}
              placeholder="Type to add resources"
            />

            <textarea
              ref={input => this.solutions = input}
              placeholder="Type to add solutions"
            />

            {/*
            <input
              type="text"
              ref="collaborators"
              placeholder="Type to add new collaborators"
            />


            */}

          <button onClick={this.submitTask.bind(this)}>Submit</button>
          <button onClick={this.closeModal}>Close</button>
      </Modal>);
  }
  
}


