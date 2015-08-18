import React from 'react';

import AuthenticatedComponent from './AuthenticatedComponent';
import { PageHeader } from './Layout';


export default AuthenticatedComponent(class Nodes extends React.Component {
  render() {
    return (
      <div className="row">
        <PageHeader>Nodes</PageHeader>
      </div>
    );
  }
});
