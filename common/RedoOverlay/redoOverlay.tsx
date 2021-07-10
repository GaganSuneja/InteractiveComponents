import React from 'react';
import { PrimaryButton } from '../../../buttons';

const RedoOverlay = (props:{text?:string}) => {
  return (
    <div style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1000,
      textAlign: 'center'
    }}>
      <div style={{ marginTop: '5%' }}>
        <PrimaryButton
          btn_text={props.text || 'Please click "Redo" button and redo this Activity'}
          isActive={true}
          className="pinkBtn"/>
      </div>
    </div>
  );
};

export default RedoOverlay;