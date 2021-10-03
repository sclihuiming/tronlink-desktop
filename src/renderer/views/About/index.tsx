import React, { useEffect, useState } from 'react';
import { Result, Typography } from 'antd';
import QRCode from 'qrcode.react';
import { FormattedMessage } from 'react-intl';

import { donateAddress } from '../../../constants';

import './About.global.scss';

const { Paragraph } = Typography;

export default function About() {
  return (
    <div className="aboutWrap">
      <div className="content">
        <Result
          icon={
            <div className="qrCode">
              <QRCode
                value={donateAddress}
                renderAs="svg"
                // level="H"
                size={160}
              />
            </div>
          }
          title={
            <Paragraph copyable={{ text: donateAddress }} className="address">
              {donateAddress}
            </Paragraph>
          }
          status="info"
        />

        <div className="description">
          <FormattedMessage id="setting.about.description" />
        </div>
      </div>
    </div>
  );
}
