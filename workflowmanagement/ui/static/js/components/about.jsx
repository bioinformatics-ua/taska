'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

import {getTASKAVersion} from '../page_settings.jsx'

export default React.createClass({
    displayName: "About",
    mixins: [Authentication],
    render() {
        return (
          <div>
            <h1>Version</h1>
            Taska - {getTASKAVersion()}
            <h1>About TASKA</h1>
            <p>TASKA is a system designed to create and manage studies. A study is a running instance of a workflow. A workflow is designated in the system as study template.</p>
            <p>The main goal of this platform is to support the organisation of tasks for groups of users.</p>
            <p>Each registered user can create its own study template or even a study.</p>
            <p>When an instance of a study template is defined, its manager has to choose assignees for each task. Assignees are responsible for the completion of a task.</p>
            <p>This platform was originally designed for support of biomedical projects, but can be used to manage a plethora of different workflows.</p>

            <h1>Available features</h1>
            <ul>
                <li>Repeatable Workflow Processes via Workflow Templates</li>
                <li>Simple tasks with I/O and dependencies</li>
                <li>Form Tasks</li>
                <li>Requests management</li>
                <li>Message system to support the interactions</li>
                <li>Basic functionality webservices that allow the system to operate without any interface</li>
                <li>reactJS client interface, with easy-to-use Workflow visual editor</li>

            </ul>

            <h1>Planned Features</h1>
            <ul>
                <li>Allow user invitation</li>
                <li>Creation of group of users</li>
                <li>Integration with external tools</li>
            </ul>
          </div>
        );
      }
});
