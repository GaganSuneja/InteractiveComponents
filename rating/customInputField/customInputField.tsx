import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
//styles
import s from './customInputField.scss';

let cx = classNames.bind(s);
type HandleInputResponse = (
  index: string,
  response: string | undefined
) => void;
import { FormInput } from '../../../buttons';
import Modal from '../../../../util/modal/modal';
import RatingModal from '../../../../util/ratingModal/ratingModal';

const CustomInputField = ({
  id,
  handleFieldClick,
  isDisabled,
  submittedValue,
}: {
  id: string;
  handleFieldClick: HandleInputResponse;
  isDisabled?: boolean;
  submittedValue?: string | undefined;
}): JSX.Element => {
  const [fieldValue, setFieldValue] = useState<string | undefined>('');
  const [inputValue, setInputValue] = useState<string | undefined>(
    submittedValue ? submittedValue : ''
  );
  const [isFieldDisabled, setIsFieldDisabled] = useState<boolean | undefined>(
    false
  );
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [inputString, setInputString] = useState<JSX.Element>(<p></p>);
  const updateInput = (event): void => {
    if (event) {
      if (!event.target.value.match(/^[1-5]$/)) {
        setShowPopup(true);
        setInputString(
          <p style={{ textAlign: 'center', fontFamily: 'Rubik,san-serif' }}>
            Please Enter Value Between 1 and 5
          </p>
        );
        setInputValue('');
        setFieldValue('');
      } else {
        setInputValue(event.target.value);
        setFieldValue(event.target.value);
      }
    }
  };

  if (isDisabled) {
    setIsFieldDisabled(true);
  }

  useEffect(() => {
    if (fieldValue) {
      handleFieldClick(id, fieldValue);
    }
  }, [fieldValue, handleFieldClick]);

  const closeForm = () => {
    setShowPopup(false);
  };

  return (
    <div>
      <FormInput
        type={'text'}
        onChange={updateInput}
        enableFormClasses={false}
        classes={'yellowInput'}
        value={inputValue}
        isDisabled={submittedValue !== undefined}
      />
      <RatingModal
        isShowing={showPopup}
        hide={closeForm}
        element={inputString}
      />
    </div>
  );
};

export { HandleInputResponse };
export default CustomInputField;
