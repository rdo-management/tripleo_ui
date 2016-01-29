import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { List, Map } from 'immutable';

import DiscoveredNodesTabPane from '../../../js/components/nodes/DiscoveredNodesTabPane';

let nodes = Map({
  discovered: List([
    { uuid: 1 },
    { uuid: 2 }
  ])
});

describe('DiscoveredNodesTabPane component', () => {
  let tabPaneVdom;
  beforeEach(() => {
    let shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<DiscoveredNodesTabPane nodes={nodes}/>);
    tabPaneVdom = shallowRenderer.getRenderOutput();
  });

  it('should render NodesTable and pass nodes as data prop', () => {
    expect(tabPaneVdom.type.name).toEqual('NodesTable');
    expect(tabPaneVdom.props.data).toEqual(nodes.get('discovered'));
  });
});
