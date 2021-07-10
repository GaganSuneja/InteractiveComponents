import React, { useCallback, useEffect, useState } from 'react';
import { activityApi } from '../../../api/activityApi';
import { saveActivityResult } from '../../module/action';
import { PuffLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import {
  MODULE_DATA,
  RATING,
  TRUE_FALSE,
  MCQ_QUESTION,
  USER,
  USER_PROFILE,
  _ID,
  override,
  FILL_IN_BLANK,
} from '../../../constants';
import TrueFalse from '../trueFalseQuestions/';
import Rating from '../rating/rating';
import Mcq from '../mcq/mcq';
import FillInBlank from '../fillInBlank/fillInBlank';
import Modal from '../../../util/modal/modal';
import { calculateScore, randomiseData } from '../../../util/commonUtils';
import fillInBlankDataProps from '../common/types';

type Props = {
  activityInfo: { moduleId: number; chapter: number; activityKey: number };
  activityType: string;
  reloadActivity?: boolean;
  showSubmit?: boolean;
  notShowLines?: boolean;
  showMessageForUnfilled?: boolean;
  activityResult?: {
    rating?: Array<any>;
  };
  setActivityResult?: (obj: Object) => void;
};

const getScoreObject = (data: any[], activity: any) => {
  if (activity.activityType === RATING) {
    return {
      score: data.length,
      totalQuestion: data.length,
      percentage: 100,
    };
  }
  return calculateScore(data);
};

const fillInBlankDefault = {
  options: [],
  questionGroup: [],
};

const ActivityWrapper: React.FC<Props> = props => {
  const [loader, setLoader] = useState<boolean>(false);
  const [submittedResults, setSubmittedResults] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [fillInBlanksData, setFillInBlanksData] = useState<
    fillInBlankDataProps
  >(fillInBlankDefault);
  const [showModal, setShowModal] = useState<boolean>(false);
  const userId = useSelector(state => state[USER]?.[USER_PROFILE]?.[_ID]);
  const [showRedo, setShowRedo] = useState<boolean>(false);
  const isModuleIncomplete = useSelector(
    state => state[MODULE_DATA]?.[`${props.activityInfo.moduleId}`]
  );

  const modalInput = (
    <>
      <div style={{ textAlign: 'center' }}>
        <p>An error occurred, please try again after some time</p>
      </div>
    </>
  );

  const getActivity = (checkUserResponse): any => {
    return activityApi.get(userId, {
      type: props.activityType,
      moduleId: props.activityInfo.moduleId,
      chapter: props.activityInfo.chapter,
      activityKey: props.activityInfo.activityKey,
      checkUserResponse: checkUserResponse,
    });
  };

  const deleteActivity = () => {
    return activityApi.delete(userId, props.activityInfo.moduleId, {
      moduleId: props.activityInfo.moduleId,
      chapter: props.activityInfo.chapter,
      activityType: props.activityType,
      activityKey: props.activityInfo.activityKey,
    });
  };

  useEffect(() => {
    setLoader(true);
    (async () => {
      try {
        const res = await getActivity(true);
        if (res.userSubmitted) {
          if (props.activityType === FILL_IN_BLANK) {
            setFillInBlanksData(res.activities);
          } else {
            setData(res.activities);
          }
          setShowRedo(res.score.percentage < 70);
          setSubmittedResults(true);
          console.log(props.activityInfo);
        } else {
          if (props.activityType === FILL_IN_BLANK) {
            setFillInBlanksData(
              res.pickCount
                ? randomiseData(res.activities, res.pickCount)
                : res.activities
            );
          } else {
            setData(
              res.pickCount
                ? randomiseData(res.activities, res.pickCount)
                : res.activities
            );
          }
          setSubmittedResults(false);
          setShowResults(false);
        }
      } catch (ex) {
        console.error('error:', ex.response.data);
        setShowModal(true);
      } finally {
        setLoader(false);
      }
    })();
  }, [props.activityInfo]);

  const saveResponse = useCallback(response => {
    setLoader(true);
    const progressObject = {
      moduleId: props.activityInfo.moduleId,
      chapter: props.activityInfo.chapter,
      activityType: props.activityType,
      activityKey: props.activityInfo.activityKey,
      data: response,
      score: getScoreObject(response, props),
    };

    saveActivityResult(userId, props.activityInfo.moduleId, progressObject)
      .then(() => {
        setShowResults(true);
        if (props.activityType === FILL_IN_BLANK) {
          setFillInBlanksData(response);
        } else {
          setData(response);
          props.setActivityResult?.(response);
        }
        setShowRedo(false);
      })
      .catch(ex => {
        console.error('error:', ex.response.data);
        setShowModal(true);
      })
      .finally(() => {
        setLoader(false);
      });
  }, []);

  const reloadActivity = async () => {
    setLoader(true);
    try {
      await deleteActivity();
      const res = await getActivity(false);
      if (props.activityType === FILL_IN_BLANK) {
        setFillInBlanksData(
          true ? randomiseData(res.activities, res.pickCount) : []
        );
      } else {
        setData(randomiseData(res.activities, res.pickCount));
      }
      setShowRedo(isModuleIncomplete && res.score.percentage < 70);
      setSubmittedResults(false);
      setShowResults(false);
    } catch (ex) {
      setShowModal(true);
      console.error('error:', ex.response.data);
    } finally {
      setLoader(false);
    }
  };

  const deleteUserActivity = useCallback(reloadActivity, []);

  const hideModal = () => {
    setShowModal(false);
  };

  if (showModal) {
    return <Modal isShowing={true} hide={hideModal} element={modalInput} />;
  } else if (loader) {
    return (
      <PuffLoader css={override} size={150} color={'#18afe6'} loading={true} />
    );
  } else {
    switch (props.activityType) {
      case TRUE_FALSE: {
        return (
          <TrueFalse
            deleteResponse={deleteUserActivity}
            submittedResults={submittedResults}
            showResults={showResults}
            data={data}
            saveResponse={saveResponse}
            showRedo={showRedo}
          />
        );
      }
      case RATING: {
        return (
          <Rating
            submittedResults={
              submittedResults || !!props.activityResult?.rating
            }
            preFilledRatings={props.activityResult?.rating}
            showResults={showResults}
            data={data}
            showSubmit={props.showSubmit}
            saveResponse={saveResponse}
            notShowLines={props.notShowLines}
            showMessageForUnfilled={props.showMessageForUnfilled}
          />
        );
      }
      case MCQ_QUESTION: {
        return (
          <Mcq
            submittedResults={submittedResults}
            showResults={showResults}
            data={data}
            saveResponse={saveResponse}
            deleteResponse={deleteUserActivity}
            showRedo={showRedo}
          />
        );
      }
      case FILL_IN_BLANK: {
        return (
          <FillInBlank
            submittedResults={submittedResults}
            showResults={showResults}
            data={fillInBlanksData}
            saveResponse={saveResponse}
            deleteResponse={deleteUserActivity}
            showRedo={showRedo}
          />
        );
      }
      default:
        return null;
    }
  }
};

export default ActivityWrapper;
