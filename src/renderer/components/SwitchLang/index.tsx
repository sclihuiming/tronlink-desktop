import { Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'renderer/store';
import { setLanguage } from 'MessageDuplex/handlers/renderApi';
import './SwitchLang.global.scss';

function SwitchLang(props: any) {
  const { lang } = props;
  const [switchChecked, setSwitchChecked] = useState(true);

  useEffect(() => {
    setSwitchChecked(lang === 'zh-CN');
  }, [lang]);

  const changLanguage = async (checked: boolean) => {
    setLanguage(checked ? 'zh-CN' : 'en-US');
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
