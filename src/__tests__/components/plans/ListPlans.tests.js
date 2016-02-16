import { List } from 'immutable';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

import ListPlans from '../../../js/components/plan/ListPlans';
import FileList from '../../../js/components/plan/FileList';
import { PlanFile } from '../../../js/immutableRecords/plans';
import store from '../../../js/store';

describe('ListPlans component', () => {
  let output;

  beforeEach(() => {
    let shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<ListPlans store={store} />);
    output = shallowRenderer.getRenderOutput();
  });

  it('renders a table of plan names', () => {
    expect(output.type.name).toEqual('ListPlans');
  });
});

let getTableRows = (planFiles, selectedFiles) => {
  let result;
  let shallowRenderer = TestUtils.createRenderer();
  shallowRenderer.render(<FileList planFiles={planFiles}
                                   selectedFiles={selectedFiles} />);
  result = shallowRenderer.getRenderOutput();
  return result.props.children[1].props.children.props.children;
};

describe('FileList component', () => {
  it('renders a list of plan files, ordered alphabetically', () => {
    let tableRows = getTableRows(
      List.of(
        new PlanFile({ name: 'foo.yaml' }),
        new PlanFile({ name: 'bar.yaml' })),
      []
    );
    expect(tableRows[0].key).toBe('bar.yaml');
    expect(tableRows[1].key).toBe('foo.yaml');
  });

  it('renders a list of selected files, ordered alphabetically', () => {
    let tableRows = getTableRows(
      List(),
      [
        { name: 'foo.yaml', content: 'foo' },
        { name: 'bar.yaml', content: 'bar' }
      ]
    );
    expect(tableRows[0].key).toBe('bar.yaml');
    expect(tableRows[1].key).toBe('foo.yaml');
  });

  it('merges a list of selected files and planfiles', () => {
    let tableRows = getTableRows(
      List.of(
        new PlanFile({ name: 'foobar.yaml' }),
        new PlanFile({ name: 'bar.yaml' })
      ),
      [
        { name: 'foo.yaml', content: 'foo' },
        { name: 'bar.yaml', content: 'bar' }
      ]
    );
    expect(tableRows[0].key).toBe('bar.yaml');
    expect(tableRows[1].key).toBe('foo.yaml');
    expect(tableRows[2].key).toBe('foobar.yaml');
  });

  it('adds classes and sorts files based on differences in selected files and planfiles', () => {
    let tableRows = getTableRows(
      List.of(
        new PlanFile({ name: 'foo.yaml', contents: 'foo' }),
        new PlanFile({ name: 'bar.yaml', contents: 'bar' })
      ),
      [
        { name: 'foo.yaml', content: 'foo' },
        { name: 'bar.yaml', content: 'changed' },
        { name: 'foobar.yaml', content: 'foobar' }
      ]
    );
    expect(tableRows[0].key).toBe('bar.yaml');
    expect(tableRows[0].props.children.props.className).toBe('changed-plan-file');
    expect(tableRows[1].key).toBe('foobar.yaml');
    expect(tableRows[1].props.children.props.className).toBe('new-plan-file');
    expect(tableRows[2].key).toBe('foo.yaml');
    expect(tableRows[2].props.children.props.className).toBe('');
  });
});
