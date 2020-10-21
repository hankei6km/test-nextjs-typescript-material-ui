import React, { useState, useReducer, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '@material-ui/core/Container';
// import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';

type previewUrlState = {
  previewUrl: string;
  imgUrl: string;
  params: [string, string][];
};

const initialState: previewUrlState = {
  previewUrl: '',
  imgUrl: '',
  params: []
};
// function initState(s: paramsState): paramsState {
//   return { ...s };
// }
// オブジェクトで型を指定しておいた方が payload の型を拘束できるのだが、
// debouce する関数をまとめるのが難しいので今回は見送り
// type actSetParam = { type: 'setParam'; payload: [string, string] };
// type actSetImgUrl = { type: 'setImgUrl'; payload: string };
type actType = {
  type: 'setParam' | 'setImgUrl';
  payload: [string, string];
};
function reducer(state: previewUrlState, action: actType): previewUrlState {
  const newState: previewUrlState = { ...state };
  switch (action.type) {
    case 'setParam':
      const ak = action.payload[0];
      let replaced = false;
      const r: [string, string][] = state.params.map(([k, v]) => {
        if (k === ak) {
          replaced = true;
          return [k, action.payload[1]];
        }
        return [k, v];
      });
      if (!replaced) {
        r.push(action.payload);
      }
      newState.params = r;
      break;
    case 'setImgUrl':
      newState.imgUrl = action.payload[0];
      break;
    default:
      throw new Error();
  }

  const q = new URLSearchParams('');
  newState.params.forEach(([k, v]) => q.append(k, v));
  const s = q.toString();
  const paramsString = newState.imgUrl && s ? `?${s}` : '';
  newState.previewUrl = `${newState.imgUrl}${paramsString}`;
  return newState;
}

const regExpPlus = /\+/g;
const regExpSlash = /\//g;

const IndexPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [previewUrl, setPreviewUrl] = useState('');

  const debounceInputText = (
    act: actType['type'],
    paramKey = '',
    transformer = (v: string | number): string => `${v}`
  ) => {
    let id: any = 0;
    return ({
      target
    }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (id !== 0) {
        clearTimeout(id);
      }
      const value = transformer(target.value);
      id = setTimeout(
        (payload: [string, string]) => {
          dispatch({ type: act, payload: payload });
          id = 0;
        },
        1000,
        paramKey ? [paramKey, value] : [value, ''] // '' が無駄だよねぇ
      );
    };
  };

  useEffect(() => {
    console.log(state.previewUrl);
    setPreviewUrl(state.previewUrl);
  }, [state.previewUrl]);

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <Container maxWidth="sm">
        <Box p={1}>
          <Card style={{ height: 200 }}>
            <img height="200" src={previewUrl} alt="preview" />
          </Card>
          <TextField
            id="preview-url"
            label="Preview URL"
            fullWidth
            value={previewUrl}
          />
        </Box>
        <Box p={1}>
          <TextField
            id="image-url"
            label="Image URL"
            defaultValue={''}
            fullWidth
            onChange={debounceInputText('setImgUrl')}
          />
        </Box>
        {[
          {
            paramsKey: 'txt64',
            label: 'text',
            defaultValue: '',
            transfomer: (v: string | number) => {
              // https://docs.imgix.com/apis/rendering#base64-variants
              // https://developer.mozilla.org/ja/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
              // https://stackoverflow.com/questions/24523532/how-do-i-convert-an-image-to-a-base64-encoded-data-url-in-sails-js-or-generally
              // https://qiita.com/awakia/items/049791daca69120d7035
              return Buffer.from(v as string, 'utf-8')
                .toString('base64')
                .replace(regExpSlash, '_')
                .replace(regExpPlus, '-');
            }
          },
          {
            paramsKey: 'txt-size',
            label: 'text font size',
            defaultValue: '12'
          },
          {
            paramsKey: 'txt-color',
            label: 'text color(#AARRGGBB)',
            defaultValue: 'FF000000'
          },
          {
            paramsKey: 'txt-align',
            label: 'text align',
            defaultValue: 'bottom,right'
          }
        ].map(
          (v: {
            paramsKey: string;
            label: string;
            defaultValue: string;
            transfomer?: (v: string | number) => string;
          }) => (
            <Box p={1} key={v.paramsKey}>
              <TextField
                id={v.paramsKey}
                label={v.label}
                defaultValue={v.defaultValue}
                fullWidth
                onChange={debounceInputText(
                  'setParam',
                  v.paramsKey,
                  v.transfomer
                )}
              />
            </Box>
          )
        )}
      </Container>
    </Layout>
  );
};

export default IndexPage;
