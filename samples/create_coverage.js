/**
 *
 * This file is part of geoserver-rest-samples.
 *
 * geoserver-rest-samples is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * geoserver-rest-samples is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with geoserver-rest-samples.  If not, see <http://www.gnu.org/licenses/>.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

const params = require('./config_params');

let URL = 'http://localhost:8080/geoserver/rest';
URL=params.URL
const WORKSPACE = 'siglibre4';
const COVERAGESTORE = 'raster';

const createCoverage = async (name) => {
  const coverageStore = {
    "coverageStore":
      {
        name: name,
        type: "ImageMosaic",
        enabled: true,
        workspace: {
          name: WORKSPACE
        }
      }
  }
  const configData = config('POST');
  configData.body = JSON.stringify(coverageStore);
  const response = await fetch(`${URL}/workspaces/${WORKSPACE}/coveragestores`, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The coveragestore ${text} has been created!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}, maybe exists.`);
  }
};

const updatedCoverageStore = async (path, coveragestore) => {
  const PUBLISHCOVERAGE = `${URL}/workspaces/${WORKSPACE}/coveragestores/${coveragestore}/file.imagemosaic`;
  const stats = fs.statSync(path);
  const fileSizeInBytes = stats.size;
  const readStream = fs.createReadStream(path);
  const configData = config('PUT');
  configData.body = readStream;
  configData.headers["Content-length"] = fileSizeInBytes;
  configData.headers["Content-Type"] = "application/zip";
  const response = await fetch(PUBLISHCOVERAGE, configData);
  const text = await response.text();
  if (response.ok) {
    return `Something great has happened. The coverage ${text} has been updated!`;
  } else {
    throw new Error(`Some terrible has happened: Status ${response.status}`);
  }
}

// 创建存储区加上传栅格影像
createCoverage(COVERAGESTORE).then(response => {
  console.log(response)
  updatedCoverageStore('./raster/test.zip', COVERAGESTORE)
     .then(response => console.log(response))
     .catch(error => console.error(error));
}).catch(error => console.error(error));


// 已有存储区，仅上传影像进去发布。已测试不能多次发布同一数据
// updatedCoverageStore('./raster/test2.zip', COVERAGESTORE)
//      .then(response => console.log(response))
//      .catch(error => console.error(error));