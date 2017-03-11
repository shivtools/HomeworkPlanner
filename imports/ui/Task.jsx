import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

// Task component - represents a single todo item
export default class Task extends Component {

  toggleChecked() {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  addSubtask() {
    let taskObj = {
      parentTask: this.props.task._id,
      assignment: 'subtask',
      resources: '',
      solutions: '',
    };

    Meteor.call('tasks.insert', taskObj, ((thisTaskId) => {
      return (error, result) => {
        Meteor.call('tasks.addSubtask', thisTaskId, result);
      };
    })(this.props.task._id));
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
            onClick={this.addSubtask.bind(this)}>
          </span>&nbsp;&nbsp;
          <span 
            className="glyphicon glyphicon-remove" 
            onClick={this.deleteThisTask.bind(this)}>
          </span>
        </span>
      </li>
    );
  }
}

Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  task: PropTypes.object.isRequired,
  showPrivateButton: React.PropTypes.bool.isRequired,
};