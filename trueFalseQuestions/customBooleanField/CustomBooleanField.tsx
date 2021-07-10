import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
//styles
import s from './customBoolean.scss';

let cx = classNames.bind(s);
import { IconCross, IconTick } from '../../../icons';

type HandleResponse = (index: string, response: boolean | undefined) => void;

const CustomBooleanField = ({
                              id,
                              handleFieldClick,
                              result
                            }: {
  id: string;
  handleFieldClick: HandleResponse;
  result: boolean | undefined;
}): JSX.Element => {
  const [trueState, setTrueState] = useState<boolean | undefined>(undefined);
  const [falseState, setFalseState] = useState<boolean | undefined>(undefined);

  const toggleSelection = (value: boolean): void => {
    if (value) {
      setTrueState(true);
      setFalseState(false);
    } else {
      setFalseState(true);
      setTrueState(false);
    }
  };

  useEffect(() => {
    if (trueState) {
      handleFieldClick(id, true);
    } else if (falseState) {
      handleFieldClick(id, false);
    }
  }, [trueState, falseState, handleFieldClick]);


  return (
    result === undefined && (
      <div>
        <button
          className={cx({ customButton: true, selected: trueState })}
          onClick={() => toggleSelection(true)}>
          TRUE
        </button>
        < button className={cx({ customButton: true, selected: falseState })}
                 onClick={() => toggleSelection(false)}>
          FALSE
        </button>
      </div>
    ) || (
      result === true && <IconTick size={'icon-20'}/> || <IconCross size={'icon-20'}/>
    )
  );
};

export { HandleResponse };
export default CustomBooleanField;
