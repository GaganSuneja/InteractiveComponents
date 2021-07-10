import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CustomInputField, {
  HandleInputResponse,
} from './customInputField/customInputField';
import HorizontalRule from '../../horizontalRule';
import { PrimaryButton } from '../../buttons';
import RedoOverlay from '../common/RedoOverlay/redoOverlay';

const Question = ({
  id,
  question,
  handleResponse,
  indexNumber,
  submittedAnswer,
}: {
  id: string;
  question: any;
  handleResponse: HandleInputResponse;
  indexNumber: number;
  submittedAnswer: string | undefined;
}): JSX.Element => {
  return (
    <div className="row" style={{ marginBottom: '2%' }}>
      <div className="col-1" style={{ textAlign: 'center' }}>
        <CustomInputField
          id={id}
          handleFieldClick={handleResponse}
          submittedValue={submittedAnswer}
        />
      </div>
      <div className="col-1 indexPadding">
        <span>{`${indexNumber + 1}. `}</span>
      </div>
      <div className="col-10 questionText">
        <span>{question}</span>
      </div>
    </div>
  );
};

type Props = {
  data: Array<{
    _id: string;
    question: Array<{
      text: string;
      rating: string;
      _id: string;
    }>;
  }>;
  saveResponse: (data: Array<any>) => void;
  showResults: boolean;
  submittedResults: boolean;
  showSubmit?: boolean;
  notShowLines?: boolean;
  preFilledRatings?: Array<any>;
  showMessageForUnfilled?: boolean;
};

const Rating = (props: Props) => {
  const [responses, setResponses] = useState({});
  const [data, setData] = useState<Array<any>>(props.preFilledRatings || []);
  const [isSubmitActive, activateSubmit] = useState<boolean>(false);
  const [ratings, setRatings] = useState<any>([]);

  const [submittedResults, setSubmittedResults] = useState<boolean>(
    props.submittedResults
  );
  const handleResponse = useCallback((id, response) => {
    setResponses(preResponses => ({ ...preResponses, [id]: response }));
  }, []);
  useEffect(() => {
    if (data.length === 0) {
      if (props.data.length === 1 && props.data[0]?.question)
        setData(props.data[0].question);
      else if (props.data.length > 1) {
        setData(props.data);
      }
    }
  }, [props.data, data]);

  const { questions } = useMemo(
    () =>
      data.reduce<{ questions: Array<any> }>(
        (acc, ratingQuestion) => {
          acc.questions.push({
            text: ratingQuestion.text,
            _id: ratingQuestion._id,
            rating: ratingQuestion.rating ? ratingQuestion.rating : undefined,
          });
          return acc;
        },
        { questions: [] }
      ),
    [data, responses]
  );
  let submittedRating = useRef<
    Array<{ question: string; _id: string; rating: string }>
  >(JSON.parse(JSON.stringify(questions)));

  useEffect(() => {
    setRatings(questions);
    submittedRating.current = JSON.parse(JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    for (const value of Object.values(responses)) {
      if (value === ' ' || value === undefined) {
        // props.activateSubmitButton(effectiveResult, false);
        activateSubmit(false);
        return;
      }
    }
    if (Object.keys(responses).length === data.length && data.length > 0) {
      submittedRating.current.forEach(rating => {
        rating.rating = responses[rating._id];
      });
      activateSubmit(true);
    }
  }, [responses, data]);

  useEffect(() => {
    if (props.showResults) {
      setRatings(submittedRating.current);
      activateSubmit(false);
      setSubmittedResults(true);
    }
  }, [props.showResults]);

  const saveResults = () => {
    props.saveResponse(submittedRating.current);
  };

  return (
    <>
      <br />
      <div className="text-black">
        {!props.notShowLines && <HorizontalRule />}
        <br />
        {!props.submittedResults && props.showMessageForUnfilled && (
          <RedoOverlay text="Please fill rating on previous page" />
        )}
        <div
          className="container"
          style={{
            filter:
              !props.submittedResults && props.showMessageForUnfilled
                ? 'blur(5px)'
                : '',
          }}
        >
          {ratings.map((question, index) => {
            return (
              <Question
                indexNumber={index}
                key={index}
                id={question._id}
                question={question.text}
                handleResponse={handleResponse}
                submittedAnswer={question.rating}
              />
            );
          })}
        </div>
        <br />

        <div style={{ textAlign: 'center' }}>
          {(props.showSubmit === undefined || props.showSubmit) && (
            <PrimaryButton
              OnClick={e => saveResults()}
              btn_text={'Submit'}
              isActive={isSubmitActive && !submittedResults}
              className="pinkBtn"
            />
          )}
        </div>
        {!props.notShowLines && <HorizontalRule />}
      </div>
    </>
  );
};

export default Rating;
