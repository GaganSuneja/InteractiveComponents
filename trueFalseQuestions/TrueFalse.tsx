import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
//components
import CustomBooleanField, { HandleResponse } from './customBooleanField';
import './trueFalse.scss';
import HorizontalRule from '../../horizontalRule';
import { PrimaryButton } from '../../buttons';
import RedoOverlay from '../common/RedoOverlay/redoOverlay';

const Question = ({
                    id,
                    question,
                    handleResponse,
                    indexNumber,
                    submittedAnswer,
                    answer
                  }: {
  id: string;
  question: any;
  handleResponse: HandleResponse;
  indexNumber: number,
  submittedAnswer: boolean | undefined,
  answer: boolean | undefined
}): JSX.Element => {
  const finalResult = (submittedAnswer === undefined) ? submittedAnswer : (submittedAnswer === answer);
  return (
    <div className="row" style={{ marginBottom: '2%' }}>
      <div className="col-3" style={{ textAlign: 'center' }}>
        <CustomBooleanField result={finalResult} id={id} handleFieldClick={handleResponse}/>
      </div>
      <div className="col-1 indexPadding">
        <span>{`${indexNumber + 1}. `}
      </span>
      </div>
      <div className="col-8 questionText">
        <span>{question}</span>
      </div>
    </div>
  );
};

type trueFalseActivityProps = {
  data: Array<any>,
  saveResponse: (data: Array<any>) => void,
  deleteResponse: () => void,
  showResults: boolean,
  submittedResults: boolean,
  showRedo: boolean
};

const TrueFalse = (activityProps: trueFalseActivityProps) => {
  const [responses, setResponses] = useState({});
  const [data, setData] = useState<Array<any>>([]);
  const [isSubmitActive, activateSubmit] = useState<boolean>(false);
  const [tfQuestions, setTfQuestions] = useState<any>([]);
  const [submittedResults, setSubmittedResults] = useState<boolean>(false);
  const [redoActivity, setRedoActivity]  = useState<boolean>(activityProps.showRedo);

  useEffect(() => {
    setSubmittedResults(activityProps.submittedResults);
  }, [activityProps.submittedResults]);

  const handleResponse = useCallback((id, response) => {
    setResponses(preResponses => ({ ...preResponses, [id]: response }));
  }, []);

  useEffect(() => {
    setData(activityProps.data);
  }, [activityProps.data]);

  const effectiveResult = {};
  const { questions } = useMemo(
    () =>
      data.reduce<{ questions: Array<any> }>(
        (acc, trueFalse) => {
          acc.questions.push({
            'question': trueFalse.question,
            'id': trueFalse._id,
            submittedAnswer: trueFalse.submittedAnswer,
            answer: trueFalse.answer
          });
          return acc;
        },
        { questions: [] }
      ),
    [data]
  );


  let submittedTf = useRef<Array<{ question: string, id: string, submittedAnswer: boolean, answer: boolean }>>(JSON.parse(JSON.stringify(questions)));

  useEffect(() => {
    setTfQuestions(questions);
    submittedTf.current = JSON.parse(JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    for (let key in responses) {
      effectiveResult[key] = responses[key];
    }
    if (Object.keys(responses).length === data.length && data.length > 0) {
      submittedTf.current.forEach(tf => tf.submittedAnswer = effectiveResult[tf.id]);
      activateSubmit(true);
    }
  }, [responses, data]);

  useEffect(() => {
    if (activityProps.showResults) {
      setTfQuestions(submittedTf.current);
      activateSubmit(false);
      setSubmittedResults(true);
    }
  }, [activityProps.showResults]);

  const saveResults = () => {
    activityProps.saveResponse(submittedTf.current);
  };

  const redo = () => {
    activityProps.deleteResponse();
  };

  return (
    <>
      {
        (<>
        <br/>
        <div className="text-black">
          <p className="text-blue-bold"> True or false:</p>
          <HorizontalRule/>
          <br/>
          <div style={{ textAlign: 'right' }}>
            {redoActivity &&  <PrimaryButton OnClick={e => redo()}
																											 btn_text={'Redo'}
																											 isActive={submittedResults}
																											 className="pinkBtn"/>}

          </div>
          {redoActivity && <RedoOverlay/>}
          <div className="container pt-10" style={{ filter: (redoActivity) ? 'blur(5px)' : '' }}>
            {tfQuestions.map((question, index) => {
              return (
                <Question
                  indexNumber={index}
                  key={index}
                  id={question.id}
                  question={question.question}
                  handleResponse={handleResponse}
                  submittedAnswer={question.submittedAnswer}
                  answer={question.answer}
                />
              );
            })}
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
          <br/>
        </>)
      }
    </>
  );
};

export default memo(TrueFalse);
