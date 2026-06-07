/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import BlogApp from './BlogApp';
import PublicFileList from './PublicFileList';

export default function App() {
  const [isPublicPath, setIsPublicPath] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    setIsPublicPath(path.startsWith('/public'));
  }, []);

  if (isPublicPath) {
    return <PublicFileList />;
  }

  return <BlogApp />;
}