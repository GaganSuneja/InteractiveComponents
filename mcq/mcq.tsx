import React, { memo, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomMcq from './customMcq/customMcq';
import s from './mcq.scss';
import classNames from 'classnames/bind';
import HorizontalRule from '../../horizontalRule';
import { PrimaryButton } from '../../buttons';
import { randomiseObject } from '../../../util/commonUtils';
import RedoOverlay from '../common/RedoOverlay/redoOverlay';

let cx = classNames.bind(s);
const Question = ({ question, options, answer, submittedResponse, handleClick, id, index }: {
  question: string;
  options: Map<string, string>;
  answer: string;
  submittedResponse: string;
  handleClick: (id: string, response: string) => void
  id: string
  index: number
}) => {
  return (
    <div className={cx(['container'], { mcqCard: true })}>
      <div className={'row'}>
        <div className={'col-1'}>
          {index}.
        </div>
        <div className={'col-11'}>
          <p>  {question}</p>
          <br/>
          <CustomMcq submittedResponse={submittedResponse} id={id} options={options} callback={handleClick}
                     answer={answer}/>
        </div>
      </div>
    </div>
  );
};

type Props = {
  data: Array<any> | Object,
  saveResponse: (data: Array<any>) => void,
  deleteResponse: () => void,
  showResults: boolean,
  submittedResults: boolean,
  showRedo: boolean
};

const Mcq = (props: Props) => {
  const [responses, setResponses] = useState({});
  const [isSubmitActive, activateSubmit] = useState<boolean>(false);
  const [submittedResults, setSubmittedResults] = useState<boolean>(false);
  const [redoActivity, setRedoActivity] = useState<boolean>(props.showRedo);

  useEffect(() => {
    setSubmittedResults(props.submittedResults);
  }, [props.submittedResults]);

  const handleResponse = useCallback((id, response) => {
    setResponses(preResponses => ({ ...preResponses, [id]: response }));
  }, []);


  const effectiveResult = {};

  const { initialQuestions } = useMemo(
    () =>
      props.data.reduce<{ initialQuestions: Array<any> }>(
        (acc, mcqQuestion) => {
          acc.initialQuestions.push({
            'answer': mcqQuestion.answer,
            'question': mcqQuestion.question,
            'id': mcqQuestion._id,
            'options': (mcqQuestion.submittedAnswer) ? mcqQuestion.options : randomiseObject(mcqQuestion.options),
            submittedAnswer: mcqQuestion.submittedAnswer
          });
          return acc;
        },
        { initialQuestions: [] }
      ),
    [props.data]
  );

  const questionArray = (questions, randomise: boolean): Array<any> => {
    let arr: Array<JSX.Element> = [];
    for (let i = 0; i < questions.length; i += 2) {
      arr.push((<React.Fragment key={i}>
        <div className="row" style={{ marginBottom: '10px' }}>
          <div className="col-6">
            <Question handleClick={handleResponse} submittedResponse={questions[i].submittedAnswer}
                      options={questions[i].options} answer={questions[i].answer} question={questions[i].question}
                      key={i}
                      id={questions[i].id}
                      index={i + 1}/>
          </div>
          <div className="col-6">
            {((i + 1) < questions.length) &&
						<Question handleClick={handleResponse} submittedResponse={questions[i + 1].submittedAnswer}
											options={questions[i + 1].options} answer={questions[i + 1].answer}
											question={questions[i + 1].question} key={i + 1}
											id={questions[i + 1].id}
											index={i + 2}/>
            }
          </div>
        </div>
      </React.Fragment>));
    }
    return arr;
  };

  const [questionsArray, setQuestionsArray] = useState<Array<{ question: string, id: string, options: string, submittedAnswer: string }>>([]);
  useEffect(() => {
    setQuestionsArray(questionArray(initialQuestions, true));
  }, [initialQuestions]);

  let submittedMcq: MutableRefObject<Array<{ question: string, id: string, options: string, submittedAnswer: string }>> = useRef<Array<{ question: string, id: string, options: string, submittedAnswer: string }>>(JSON.parse(JSON.stringify(initialQuestions)));

  useEffect(() => {
    for (let key in responses) {
      effectiveResult[key] = responses[key];
    }
    if (Object.keys(responses).length === props.data.length && props.data.length > 0) {
      for (let i = 0; i < submittedMcq.current.length; i++) {
        submittedMcq.current[i].submittedAnswer = responses[submittedMcq.current[i].id];
      }
      activateSubmit(true);
    }
  }, [responses]);

  useEffect(() => {
    if (props.showResults) {
      setQuestionsArray(questionArray(submittedMcq.current, false));
      activateSubmit(false);
      setSubmittedResults(true);
    }
  }, [props.showResults]);

  const saveResults = () => {
    props.saveResponse(submittedMcq.current);
  };

  const redo = () => {
    props.deleteResponse();
  };
  return (
    <>
      <br/>
      <div className="text-black">
      <p className="text-blue-bold" >
        Mcq Questions
      </p>
      <HorizontalRule/>
      <br/>
      <div className={'container'} style={{ backgroundColor: '#59b7ec', padding: '10px', marginBottom: '10px' }}>
        <div className={'row'}>
          <div className={'col-2'}/>
          <div className={'col-8'} style={{ textAlign: 'center' }}>
          </div>
          <div className={'col-2'}>
            <div style={{ textAlign: 'right' }}>
              {redoActivity && <PrimaryButton OnClick={e => redo()}
																							btn_text={'Redo'}
																							isActive={submittedResults}
																							className="pinkBtn"/>}

            </div>
          </div>
        </div>
        {redoActivity && <RedoOverlay/>}
        <div className={'container'} style={{ filter: (redoActivity) ? 'blur(5px)' : '' }}>
          {
            questionsArray
          }
        </div>
      </div>
      <br/>
      <div style={{ textAlign: 'center' }}>
        <PrimaryButton OnClick={e => saveResults()}
                       btn_text={'Submit'}
                       isActive={isSubmitActive && !submittedResults}
                       className="pinkBtn"/>
      </div>
      <HorizontalRule/>
      </div>
    </>);

};

export default memo(Mcq);

