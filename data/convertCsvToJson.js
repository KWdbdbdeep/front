import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

const csvFilePath = path.join(path.resolve(), 'data/서울특별시 공공자전거 신규가입자 정보(월별)_23.1-6.csv');
const jsonFilePath = path.join(path.resolve(), 'public/userStatistics.json');

try {
    // 파일을 동기적으로 읽고, iconv를 사용하여 인코딩 변환
    const buffer = fs.readFileSync(csvFilePath);
    const data = iconv.decode(buffer, 'EUC-KR');

    // d3-dsv를 사용하여 CSV 데이터를 JSON으로 파싱
    const d3 = await import('d3-dsv');
    const jsonData = d3.csvParse(data);

    // JSON 데이터를 파일에 저장
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log('CSV file has been converted to JSON');
} catch (error) {
    console.error('Error:', error);
}