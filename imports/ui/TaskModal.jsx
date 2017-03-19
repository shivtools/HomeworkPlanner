import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import Modal from 'react-modal';

import Datetime from 'react-datetime';

// styles
import 'react-datetime/css/react-datetime.css';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '50%',
    height                : '50%',
  },
};

export default class TaskModal extends Component {

  constructor(props) {
    super(props);
 
    this.state = {
      modalIsOpen: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.submitTask = this.submitTask.bind(this);
  }
  
  // Methods to handle close, after open and opening of the modal
  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  submitTask() {
    // Find the text field via the React ref
    const taskObj = {
      parentTask: this.props.parentTask,
      assignment: this.assignment.value.trim(),
      resources: this.resources.value.trim(),
      solutions: this.solutions.value.trim(),
      // deadline: this.deadline.value.trim(),
      // collaborators: this.collaborators.value.trim(),
    };


    // If a parent task ID does not exist (meaning this is the top most parent task in the chain),
    // then simply add the task object to the DB
    if (!this.props.parentTask) {
      Meteor.call('tasks.insert', taskObj);
    } else {
      // Else, there is a parent task associated with this task, so add this task as a subtask of
      // parent task
      Meteor.call('tasks.insert', taskObj, (error, result) => {
        Meteor.call('tasks.addSubtask', this.props.parentTask, result);
      });
    }
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (
      <Modal
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >

        <h2>Add a task</h2>

        <textarea
          ref={(input) => { this.assignment = input; }}
          placeholder="Type to add assignment"
        />

        <textarea
          ref={(input) => { this.resources = input; }}
          placeholder="Type to add resources"
        />

        <textarea
          ref={(input) => { this.solutions = input; }}
          placeholder="Type to add solutions"
        />

        <Datetime ref={(date) => { this.date = date; }} />

        {/*
        <input
          type="text"
          ref="collaborators"
          placeholder="Type to add new collaborators"
        />
        */}

        <button onClick={this.submitTask}>Submit</button>
        <button onClick={this.closeModal}>Close</button>
      </Modal>);
  }
  
}

TaskModal.propTypes = {
  parentTask: React.PropTypes.string,
};
