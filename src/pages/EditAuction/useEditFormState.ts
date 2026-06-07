// useEditFormState.ts
// Same shape as CreateAuctionPage/useFormState but initialised with
// the existing auction values fetched from the API.

import { useReducer, useMemo, useCallback } from 'react';
import type { AuctionCategory, AuctionDuration, ConditionGrade } from '../../types/auction';

export type EditFormState = {
  title:          string;
  description:    string;
  category:       AuctionCategory;
  provenance:     string;
  reservePrice:   number | '';
  startingBid:    number | '';
  duration:       AuctionDuration;
  startDate:      string;
  conditionGrade: ConditionGrade;
  location:       string;
  bidMethod:      'TND' | 'SOL';
  walletConnected: boolean;
  walletAddress:   string;
};

type Action = {
  type:  'SET_FIELD';
  field: keyof EditFormState;
  value: EditFormState[keyof EditFormState];
};

function reducer(state: EditFormState, action: Action): EditFormState {
  return { ...state, [action.field]: action.value };
}

export function useEditFormState(initial: EditFormState) {
  const [form, dispatch] = useReducer(reducer, initial);

  const setField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );

  const isValid = useMemo(
    () =>
      form.title.trim() !== '' &&
      form.description.trim() !== '' &&
      form.startingBid !== '' &&
      Number(form.startingBid) > 0 &&
      form.startDate !== '' &&
      (form.bidMethod === 'TND' || form.walletConnected),
    [form.title, form.description, form.startingBid, form.startDate, form.bidMethod, form.walletConnected],
  );

  return { form, setField, isValid };
}
