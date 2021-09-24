import { Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { setLanguage } from 'MessageDuplex/handlers/renderApi';
import './SwitchLang.global.scss';
import { EN_US, ZH_CN } from '../../../constants';

function SwitchLang(props: any) {
  const { lang } = props;
  const [switchChecked, setSwitchChecked] = useState(true);

  useEffect(() => {
    setSwitchChecked(lang === ZH_CN);
  }, [lang]);

  const changLanguage = async (checked: boolean) => {
    setLanguage(checked ? ZH_CN : EN_US);
  };

  return (
    <div className="languageWrap">
      <Switch
        className="customSwitch"
        checkedChildren=" 中  文 "
        unCheckedChildren="English"
        checked={switchChecked}
        onClick={changLanguage}
      />
    </div>
  );
}

export default connect((state: RootState) => {
  return {
    lang: state.app.lang,
  };
})(SwitchLang);
