import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import classnames from 'classnames';

import { Tasks } from '../api/tasks.js';

// Task component - represents a single todo item
class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subtasks: this.props.task.subtasks,
    };
  }

  toggleChecked() {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  addSubtask() {
    const taskObj = {
      parentTask: this.props.task._id,
      assignment: 'subtask',
      resources: '',
      solutions: '',
    };

    Meteor.call('tasks.insert', taskObj, (error, result) => {
      Meteor.call('tasks.addSubtask', this.props.task._id, result);
      this.setState({ subtasks: this.state.subtasks.concat([result]) });
    });
  }

  renderSubtasks() {
    const showPrivateButton = true;
    
    return this.props.subtasks.map((task) => {
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
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
          ) : ''
        }

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.assignment}
        </span>

        <span className="pull-right">
          <span 
            className="glyphicon glyphicon-plus"
            onClick={this.addSubtask.bind(this)} >
          </span>&nbsp;&nbsp;
          <span 
            className="glyphicon glyphicon-remove" 
            onClick={this.deleteThisTask.bind(this)}>
          </span>
        </span>

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
  subtasks: PropTypes.array,
};


export default TaskContainer = createContainer(({ task }) => {
  Meteor.subscribe('tasks');

  return {
    subtasks: Tasks.find({ _id: { $in: task.subtasks } }).fetch(),
  };
}, Task);
