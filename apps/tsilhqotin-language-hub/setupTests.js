import fetch from 'node-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';

global.React = React;
global.ReactDom = ReactDom;
global.PropTypes = PropTypes;
global.fetch = fetch;
