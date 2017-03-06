import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../api/tasks.js';
import Modal from 'react-modal';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

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

// App component - represents the whole app
class App extends Component {

  constructor(props) {

    super(props);
 
    this.state = {
      hideCompleted: false,
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  submitTask(){
    // Find the text field via the React ref
    let taskObj = {
      assignment: this.assignment.value.trim(),
      // resources: this.resources.value.trim(),
      // deadline: this.deadline.value.trim(),
      // collaborators: this.collaborators.value.trim(),
      // solutions: this.solutions.value.trim()
    };

    Meteor.call('tasks.insert', taskObj);

    //closeModal();
 
  }

  //Methods to handle close, after open and opening of the modal
  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }
  
  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;
 
      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>

          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>


          <button onClick={this.openModal}>Open Modal</button>

          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >

            <h2>Add a task</h2>
              <textarea
                ref={input => this.assignment = input}
                placeholder="Type to add assignment"
              />

              {/*
              <textarea
                ref="resources"
                placeholder="Type to add resources"
              />

               <input
                type="text"
                ref="deadline"
                placeholder="Type to add new deadline"
              />

              <input
                type="text"
                ref="collaborators"
                placeholder="Type to add new collaborators"
              />

              <textarea
                ref="solutions"
                placeholder="Type to add solutions"
              />
              */}

            <button onClick={this.submitTask.bind(this)}>Submit</button>
            <button onClick={this.closeModal}>Close</button>
          </Modal>

          <AccountsUIWrapper />

        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object
};

export default createContainer(() => {

  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  };
}, App);