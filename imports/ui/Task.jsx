import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import classnames from 'classnames';

import TaskModal from './TaskModal.jsx';
import { Tasks } from '../api/tasks.js';

// Task component - represents a single todo item
class Task extends Component {

  constructor(props) {
    super(props);

    this.toggleChecked = this.toggleChecked.bind(this);
    this.togglePrivate = this.togglePrivate.bind(this);
    this.addSubtask = this.addSubtask.bind(this);
    this.deleteThisTask = this.deleteThisTask.bind(this);
    this.openSubTaskModal = this.openSubTaskModal.bind(this);
  }

  toggleChecked() {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  openSubTaskModal() {
    this.modal.openModal();
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  deleteThisTask() {

    this.deleteTaskByID(this.props.task._id);

  }

  //sexy recursive function
  deleteTaskByID(taskID){
    /*
        Find all subtasks:
          - if no subtasks, return
          - get all subtask IDs
            - delete the parent task 
            - call function recursively on each subtaskID
    */

    //Find task associated with taskID from database
    let dbTask = Tasks.find({ _id: taskID }).fetch();

    //Find subtasks associated with this task
    let subtaskIDs = dbTask.subtasks;

    //Only if subtasks exist, then call the recurisve function on each subtask ID
    if(subtaskIDs && subtaskIDs.length != 0){
      subtaskIDs.forEach((subTaskID) => { deleteTaskByID(subtaskID) } );
      console.log(subTaskIDs);
    }

    //Delete the current (parent) task from database
    Meteor.call('tasks.remove', taskID);
  }

  addSubtask() {
    this.openSubTaskModal();
  }

  renderSubtasks() {
    return this.props.subtasks.map((task) => {
      const showPrivateButton = true;
      
      return (
        <TaskContainer
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });

    return (
      <li className={taskClassName}>
        <input
          type="checkbox"
          readOnly
          checked={this.props.task.checked}
          onClick={this.toggleChecked}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
          ) : ''
        }

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.assignment}
        </span>

        <span className="pull-right">
          <button type="button" className="btn btn-default btn-sm" onClick={this.addSubtask}>
            <span className="glyphicon glyphicon-plus" />
          </button>
          &nbsp;&nbsp;
          <button type="button" className="btn btn-default btn-sm" onClick={this.deleteThisTask}>
            <span className="glyphicon glyphicon-remove" />
          </button>
        </span>

        <TaskModal parentTask={this.props.task._id} ref={(modal) => { this.modal = modal; }} />

        <ul>
          { this.renderSubtasks() }
        </ul>
      </li>
    );
  }
}

Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  task: PropTypes.object.isRequired,
  showPrivateButton: React.PropTypes.bool.isRequired,
  subtasks: PropTypes.arrayOf(PropTypes.object),
};


const TaskContainer = createContainer(({ task }) => {
  Meteor.subscribe('tasks');

  return {
    subtasks: Tasks.find({ _id: { $in: task.subtasks } }).fetch(),
  };
}, Task);

export default TaskContainer;
