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
                TASKA is a extendable task manager with structured workflow-oriented features.
                In this page we will have a quick explanation of all main concepts of the system and how they interconnect.
            </p>
            <h2>Task</h2>

            <p>The Task is the basic unit on TASKA, everything is a composition or at least related with a task.</p>
            <p>Tasks have inputs and outputs, descriptions and can be of several types, such as Simple Tasks or Form Tasks.</p>
            <p>Tasks are the unitary block used to construct protocols.</p>

            <h2>Protocol</h2>

            <p>A protocol is a composition of dependency related tasks, structured in a ordered way, to accomplish objectives or results.</p>
            <p>The purpose of protocols is specifying a followable structure, that mixes tasks with the workflow of the tasks.</p>
            <p>Protocols can be public or private. Public protocols will be made available for everyone on the system.</p>

            <p>A protocol works as a template for the study.</p>

            <h2>Study</h2>

            <p>A study is a instanciation of a protocol, with a specified group of users and deadlines for each of the tasks that compose the protocol.</p>
            <p>The main concept behind separating protocols from the protocol instanciations, is easily allowing repeatability of tasks, across time and intervenients.</p>

            <h2>Request</h2>

            <p>A request is a communication vehicle for the user completing a task, to interact with a study overseer. </p>
            <p>Asking for reassignment, clarification or any other type of feedback can be asked through requests.</p>

            <h2>Form</h2>

            <p>Forms are questionnaires with several types of questions, such as Select dropdowns, multiple choice or checkboxes.</p>
            <p>Forms are created to be used on Form Tasks, so study overseers can collect information in an uniformized template.</p>
            <p>The reason they are separated from the task itself, is allowing reusability of the same form in different tasks.</p>

            <h2>History</h2>

            <p>History relates with actions made through the usage of the system. Whenever there is an action the ocurrs on the system, it is logged on history, so users can in a feed-like approximation, look at what happened and who made what.</p>

            <h2>Usage Profiles</h2>

            <p>There are essential two types of user roles on the system, which each user can play.</p>

            <p>The user can be a study overseer, which is overseeing the study flows, analysing outcomes and all other tasks related with study management.</p>
            <p>The user can be a study responder, which is replying to study overseer tasks, without needing to care about other users work.</p>

            <hr />
            <h1>The Main Dashboard</h1>
            <p>When a user logs in, he is presented with a dashboard that reflects his private view of the system. This dashboard is divided in six areas, that try to reflect all functionality available on the system, combining the two user profiles into one single interface.</p>

            <h2>My Protocols</h2>

            <p>In this section, we can see owned protocols, or public protocols. Owned protocols can be edited through a rich visual editor, and public protocols can be duplicated (to be modified), or simply used as they are.</p>

            <p>We can use this area to create, modify, and delete protocols, but also to run protocols as studies, through the run functionality.</p>

            <h2>My Studies</h2>

            <p>In this section users can see studies they ran, or are still running. It allows to manage and oversee the studies with a overview, but also analyse and obtain the results from the studies.</p>

            <p>Only the user running the study has access to this view.</p>

            <h2>My Tasks</h2>

            <p>In this section users can see and answer to tasks attributed to themselves by study overseers. They are ordered by default based on deadline, so users can prioritize tasks.</p>

            <h2>Received Requests</h2>

            <p>In this section, the user can see replied and still to reply requests made by users answering tasks in their studies.</p>

            <h2>My Forms</h2>

            <p>In this section users can see forms they created and manage them using an rich visual editor.</p>

            <h2>History</h2>

            <p>In this section, users can see user-related history. This can range from all actions on the system made by himself, or by other in his studies.</p>

          </div>
        );
      }
});
