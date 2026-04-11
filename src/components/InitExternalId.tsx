'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

export default function InitExternalId() {
  useEffect(() => {
    let externalId = Cookies.get('external_id');
    if (!externalId) {
      externalId = uuidv4();
      Cookies.set('external_id', externalId, { expires: 30, path: '/' });
    }
  }, []);

  return null;
}
