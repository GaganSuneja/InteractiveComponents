import React, { useState } from 'react';
import s from './customMcq.scss';
import classNames from 'classnames/bind';

let cx = classNames.bind(s);

type Props = {
  options: Map<string, string>
  callback: (id: string, key: string) => void,
  answer: string;
  id: string,
  submittedResponse: string
};

type mcqOption = {
  key: string, option: string, isCorrect: boolean, isIncorrect: boolean
};

const CustomMcq = (props: Props) => {
  const { callback, id } = props;
  const { options } = props;
  let displayOptions: Array<{ key: string, option: string, isCorrect: boolean, isIncorrect: boolean }> = [];
  const [highlightedOption, setHighlightedOption] = useState({});
  for (const [key, value] of Object.entries(options)) {
    const preCondition = props.submittedResponse !== undefined && props.submittedResponse === key;
    const isCorrect =   preCondition && props.submittedResponse === props.answer;
    const isIncorrect =  preCondition && props.submittedResponse !== props.answer
    displayOptions.push({
      key: key,
      option: value,
      isCorrect: isCorrect,
      isIncorrect: isIncorrect
    });
  }


  const setResponse = (key) => {
    callback(id, key);
    setHighlightedOption({ [key]: true });
  };

  return (
    <div className={cx({ optionsContainer: true }, ['container-fluid'])}>
      {displayOptions.map((option, index) => {
        return (
          <div key={index} className={'row'} onClick={() => {
            setResponse(option.key);
          }}>
            <div
              className={cx(['col-12'], {
                optionRow: true,
                green: option.isCorrect,
                red: option.isIncorrect,
                disable: props.submittedResponse
              }, { optionRowHighlighted: highlightedOption[option.key] && !props.submittedResponse })}>
              {String.fromCharCode(index + 65)}. {`${option.option}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomMcq;