/* eslint-disable no-param-reassign */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({

  'tasks.insert'(taskObj) {
    check(taskObj, Object);
 
    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    taskObj.createdAt = new Date();
    taskObj.owner = this.userId;
    taskObj.username = Meteor.users.findOne(this.userId).username;
    taskObj.checked = false;
    taskObj.subtasks = [];
     
    return Tasks.insert(taskObj);
  },

  'tasks.remove'(taskId) {
    check(taskId, String);
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    // Remove reference of this task (from subtasks array of IDs) from its parent task
    if (task.parentTask) {
      Tasks.update(task.parentTask, { $pull: { subtasks: taskId } });
    }

    Tasks.remove(taskId);
  },

  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, { $set: { checked: setChecked } });
  },

  'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);
 
    const task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },

  'tasks.addSubtask'(taskId, subtaskId) {
    check(taskId, String);
    check(subtaskId, String);

    Tasks.update(taskId, { $push: { subtasks: subtaskId } });
  },
});
