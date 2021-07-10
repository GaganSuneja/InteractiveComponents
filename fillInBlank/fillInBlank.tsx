import React, { useCallback, useEffect, useState,memo } from 'react';
import s from './fillInBlank.scss';
import classNames from 'classnames/bind';
import { IconCross, IconTick } from '../../icons';
import HorizontalRule from '../../horizontalRule';
import { PrimaryButton } from '../../buttons';
import RedoOverlay from '../common/RedoOverlay/redoOverlay';
import { randomiseData } from '../../../util/commonUtils';
import {defaultMemoize} from 'reselect';

let cx = classNames.bind(s);

type OptionProps = {
  data: Array<string>
}

const Options = memo((props: OptionProps) => {
  const {data} = props;
  const [options,setOptions] = useState<any>([]);
  useEffect(()=>{
    setOptions(data);
  },[data]);

  const dragElement = (ev, id) => {
    ev.dataTransfer.setData('id', id);
  };

  return (
    <div className={'container'}>
      <div className={'row'}>
        {
          options.map((option, index, options) => {
            return (
              <div style={{ width: `${Math.floor(100 / options.length)}%` }} className={cx({ optionBox: true })}
                   key={index}
                   id={option}>
                <span onDragStart={(ev) => dragElement(ev, option)}
                      draggable>{option.charAt(0).toUpperCase() + option.slice(1, option.length)}</span>
              </div>
            );
          })
        }
      </div>
      <br/>
      <br/>
    </div>
  );
});

type Props = {
  data: Array<{
    answer: string,
    question: string,
    id: string,
    submittedAnswer?: string
    }> ;
  showResults: boolean;
  showRedo:boolean;
  saveResponse: (data: Array<any>) => void,
  deleteResponse: () => void,
  submittedResults: boolean,
};

const dropableSentences = defaultMemoize((questions: Array<{ answer: string, question: string,  id: string , submittedAnswer?: string}>) => {
  let modifiedSentences: Array<{ answer: string, submittedAnswer?: string, startText: string, endText: string, id: string }> = [];
  const options:Array<string> = []
  questions.forEach((question, index) => {
    const startText = question.question.slice(0, question.question.indexOf('#blank#'));
    const endText = question.question.slice(question.question.indexOf('#blank#') + '#blank#'.length);
    modifiedSentences.push({
      ...question,
      startText: startText,
      endText: endText
    });
    options.push(question.answer);
  });
  return [modifiedSentences,randomiseData(options,options.length)];
});


const FillInBlank = (props: Props) =>  {
  const [isSubmitActive, activateSubmit] = useState<boolean>(false);
  const [responses, setResponses] = useState({});
  const [submittedResults, setSubmittedResults] = useState<boolean>(props.submittedResults);
  const [randomisedSentences,randomisedOptions] = (props.data.length)?dropableSentences(props.data):[[],[]];

  const onDragOver = (event) => {
    event.preventDefault();
  };
 
  const onDrop = (event, questionId) => {
    const answer = event.dataTransfer.getData('id');
    if (answer) {
      setResponses(preResponses => ({ ...preResponses, [questionId]: answer }));
      if (++Object.keys(responses).length === randomisedSentences.length) {
        activateSubmit(true);
      }
    }
  };

  useEffect(() => {
    if (props.showResults) {
      activateSubmit(false);
      setSubmittedResults(true);
    }
  }, [props.showResults]);

  const handlePrimaryButtonClick = useCallback(() => {
    props.deleteResponse();
  },[props.deleteResponse]);

  const handleSaveResults = useCallback(() => {
    for (let i = 0; i < randomisedSentences.length; i++) {
      randomisedSentences[i].submittedAnswer = responses[randomisedSentences[i].id];
    }
    props.saveResponse(randomisedSentences);
  },[props.saveResponse,randomisedSentences,responses]);

  return (
    <>
     <div className="text-black">
      <br/>
      <p className="text-blue-bold"> Fill in the Blanks:</p>
      <p className="text-black"> Drag and drop the correct word:</p>
      <HorizontalRule/>
      <br/>
      <div className={'container'} style={{ filter: (props.showRedo) ? 'blur(5px)' : '' }}>
      <Options data={randomisedOptions}/>
      </div>
      <div style={{ textAlign: 'right' }}>
            {props.showRedo &&  <PrimaryButton OnClick={handlePrimaryButtonClick}
																											 btn_text={'Redo'}
																											 isActive={submittedResults}
																											 className="pinkBtn"/>}

          </div>
          {props.showRedo && <RedoOverlay/>}
          <div className={'container'} style={{ filter: (props.showRedo) ? 'blur(5px)' : '' }}>
      {
        randomisedSentences.map((question, index) =>
          (<div key={index} className={'row'}>
            <div className={'col-12'}>
              <div className="text-black mb-20">
                {question.startText}
                <div className={cx({ dropBox: true })}
                     onDrop={event => onDrop(event, question.id)}
                     onDragOver={(ev) => onDragOver(ev)}>
                  <span>{question.submittedAnswer || responses[question.id]}</span>
                </div>
                {question.endText}
                &nbsp;&nbsp;
                {question.submittedAnswer !== undefined && (question.submittedAnswer === question.answer ?
                  <IconTick size={'iconSize'}/> :
                  <IconCross size={'iconSize'}/>)}
              </div>
            </div>
          </div>))
      }
      </div>

      <br/>
      <div style={{ textAlign: 'center' }}>
            <PrimaryButton OnClick={handleSaveResults}
                           btn_text={'Submit'}
                           isActive={isSubmitActive && !submittedResults}
                           className="pinkBtn"/>
      </div>
      <HorizontalRule/>
      </div>
    </>
  );
};

export default FillInBlank;

