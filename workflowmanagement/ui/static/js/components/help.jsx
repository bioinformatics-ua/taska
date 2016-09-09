'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

export default React.createClass({
    displayName: "Help",
    mixins: [Authentication],
    render() {
        return (
          <div>
            <h1>Getting Started</h1>
            <p>
                TASKA is an extensible task manager with structured workflow-oriented features.
                This page contains a brief explanation of the system's main concepts and how they are interconnected.
            </p>
            <h2>Task</h2>

            <p>The Task is the basic unit on TASKA, everything is a composition or at least related with a task.</p>
            <p>Tasks have inputs and outputs, descriptions and can be of several types, such as Simple Tasks or Form Tasks.</p>
            <p>Tasks are the unitary block used to construct study templates.</p>

            <h2>Study template</h2>

            <p>A study template is a composition of dependency related tasks, structured in a ordered way, to accomplish objectives or results.</p>
            <p>The purpose of study templates is specifying a straightforward structure, that mixes the tasks with a flow that guides them.</p>
            <p>study templates can be public or private. Public study templates are available for all registered users.</p>

            <p>A study template works as a template for the study.</p>

            <h2>Study</h2>

            <p>A study is a study template's instance, with a specified group of users and deadlines for each of the tasks that composes the study template.</p>
            <p>The main concept behind separating study templates from the instances is to easily allow repeatability of tasks across time and intervenients.</p>

            <h2>Request</h2>

            <p>A request is a communication vehicle that allows the user who is completing a task to interact with a study overseer. </p>
            <p>Asking for reassignment, clarification or any other type of feedback can be made through requests.</p>

            <h2>Form</h2>

            <p>Forms are questionnaires with several types of questions such as Select dropdowns, multiple choice or checkboxes.</p>
            <p>Forms are created to be used on Form Tasks, so study overseers can collect information in a uniformed template.</p>
            <p>The reason they are separated from the task itself, is to allow the reusability of the same form in different tasks.</p>

            <h2>History</h2>

            <p>History is a detailed list of all performed actions in the system. It can be used to backtrack users activities.</p>

            <h2>Usage Profiles</h2>

            <p>This system has two types of user roles: </p>
            <ul>
                <li>Study overseer - oversee study flows, analyse outcomes and perform all related study management tasks</li>
                <li>Study responder - reply the overseer's tasks</li>
            </ul>

            <hr />
            <h1>The Main Dashboard</h1>

            <p>Private and complete view of the system after login.</p>

            <p>This dashboard is divided into six areas evidencing all the system's available features and combines the two different user profiles into one single interface.</p>

            <h2>study templates</h2>

            <p>In this section, user's study templates and public study templates are shown. User's study templates can be edited through a rich visual editor and public study templates can be duplicated (to be modified), or simply used as they are.</p>

            <p>This area can be used to create, modify and delete study templates, but also to run study templates as studies, through the run feature. When we want to create a study from a study template, we must click run and choose the deadlines and assignee's.</p>

            <h2>Studies</h2>

            <p>In this section users have access to finished or ongoing (still running) studies. It allows to manage and oversee the studies with an overview, but also analyse and obtain the results from the studies.</p>

            <p>Only the user running the study has access to this view.</p>

            <h2>Tasks</h2>

            <p>In this section users can see and answer to tasks assigned to them by study overseers. They are ordered by default based on deadline, so users can prioritize tasks.</p>

            <h2>Received Requests</h2>

            <p>In this section, the user can see replied and still to reply requests made by users answering tasks in their studies.</p>

            <h2>Forms</h2>

            <p>In this section users can see forms they created and manage them using an rich visual editor.</p>

            <h2>History</h2>

            <p>In this section, users can see user-related history. This can range from all actions on the system, or by others in his studies.</p>

          </div>
        );
      }
});
