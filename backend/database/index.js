// database/index.js
import mysql from 'mysql2/promise';

const config = {
    host: 'localhost', // DB 주소 (현재는 로컬호스트)
    user: 'root', // DB 계정 이름으로 변경
    password: 'oracle', // DB 계정 비밀번호으로 변경
    database: 'edu_community', // 데이터베이스 이름으로 변경 (교재에서는 edu_community)
    waitForConnections: true,
    port: 3306,
    connectionLimit: 10, // 기본값은 10
};

/* DB Pool 생성 */
const pool = mysql.createPool(config);

/* 쿼리 함수 */
const query = async (queryString, response) => {
    console.log('Executing query:', queryString);
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(queryString);
            connection.release();
            return rows;
        } catch (error) {
            console.error('Query Error:', error);
            connection.release();
            return response.status(500).json({ code: 'Query Error' });
        }
    } catch (error) {
        console.error('DB Connection Error:', error);
        return response.status(500).json({ code: 'DB Error' });
    }
};

export const getConnection = async () => {
    return await pool.getConnection();
};

export { config, pool, query };
