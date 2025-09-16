import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { questions, text_questions } from '../static/questions';
import { supabase } from '../lib/supabaseClient';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [historicalData, setHistoricalData] = useState([]);
  // const [comments, setComments] = useState({ improvement: [], positive: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 주차별 데이터를 처리하는 함수
  const processWeeklyData = (data) => {
    const weeklyGroups = {};
    
    data.forEach(item => {
      const week = item.week || '미분류';
      if (!weeklyGroups[week]) {
        weeklyGroups[week] = {
          week: week,
          surveys: [],
          q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
          count: 0
        };
      }
      weeklyGroups[week].surveys.push(item);
    });

    // 각 주차별 평균 계산
    return Object.values(weeklyGroups).map(weekData => {
      const count = weekData.surveys.length;
      if (count === 0) return weekData;

      weekData.q1 = parseFloat((weekData.surveys.reduce((sum, s) => sum + (s.q1 || 0), 0) / count).toFixed(1));
      weekData.q2 = parseFloat((weekData.surveys.reduce((sum, s) => sum + (s.q2 || 0), 0) / count).toFixed(1));
      weekData.q3 = parseFloat((weekData.surveys.reduce((sum, s) => sum + (s.q3 || 0), 0) / count).toFixed(1));
      weekData.q4 = parseFloat((weekData.surveys.reduce((sum, s) => sum + (s.q4 || 0), 0) / count).toFixed(1));
      weekData.q5 = parseFloat((weekData.surveys.reduce((sum, s) => sum + (s.q5 || 0), 0) / count).toFixed(1));

      return {
        week: weekData.week,
        q1: weekData.q1,
        q2: weekData.q2,
        q3: weekData.q3,
        q4: weekData.q4,
        q5: weekData.q5,
        count,
        created_at: weekData.surveys[0].created_at
      };
    }).sort((a, b) => {
      // 주차별 정렬 (1주차, 2주차... 순으로)
      const aNum = parseInt(a.week.match(/\d+/)?.[0]) || 0;
      const bNum = parseInt(b.week.match(/\d+/)?.[0]) || 0;
      return aNum - bNum;
    });
  };

  const getHistoricalData = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return processWeeklyData(data);
    } catch (err) {
      console.error('Historical data fetch error:', err);
      throw err;
    }
  };

  // const getComments = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('pulse_surveys')
  //       .select('comment1, comment2, created_at, week')
  //       .order('created_at', { ascending: false })
  //       .limit(20); // 최근 20개만 가져오기
      
  //     if (error) throw error;
      
  //     const improvement = [];
  //     const positive = [];
      
  //     data.forEach(survey => {
  //       if (survey.comment1 && survey.comment1.trim()) {
  //         improvement.push({response: survey.comment1.trim(), created_at: survey.created_at});
  //       }
  //       if (survey.comment2 && survey.comment2.trim()) {
  //         positive.push({response: survey.comment2.trim(), created_at: survey.created_at});
  //       }
  //     });
      
  //     return {
  //       improvement,
  //       positive
  //     };
  //   } catch (err) {
  //     console.error('Comments fetch error:', err);
  //     throw err;
  //   }
  // };

  const convertDate = (dateString) => {
    //date를 00년 0월 0주차로
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = date.getMonth() + 1;
    const week = Math.ceil((date.getDate() + (date.getDay() === 0 ? 7 : date.getDay())) / 7);
    return `${year}년 ${month}월 ${week}주차`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [historicalData, commentsData] = await Promise.all([
          getHistoricalData(),
          // getComments()
        ]);
        
        setHistoricalData(historicalData);
        // setComments(commentsData);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        
        // 오류 시 기본 데이터 설정
        setHistoricalData([
          { week: '1주차', q1: 3.2, q2: 3.8, q3: 3.5, q4: 2.9, q5: 3.1 },
          { week: '2주차', q1: 3.4, q2: 3.6, q3: 3.3, q4: 3.2, q5: 3.0 },
          { week: '3주차', q1: 3.8, q2: 4.1, q3: 3.7, q4: 3.5, q5: 3.4 },
          { week: '4주차', q1: 3.6, q2: 3.9, q3: 3.8, q4: 3.3, q5: 3.2 },
        ]);
        // setComments([
        //   {
        //     week: '1주차',
        //     comments: [
        //       {
        //         question: "팀에서 개선되었으면 하는 점이 있다면 자유롭게 적어주세요.",
        //         answer: "팀 협업이 점점 개선되고 있는 것 같습니다.",
        //         type: 'improvement'
        //       },
        //       {
        //         question: "팀에서 잘되고 있다고 생각하는 점이 있다면 적어주세요.",
        //         answer: "의사소통이 원활해져서 좋습니다.",
        //         type: 'positive'
        //       }
        //     ]
        //   }
        // ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 오류 메시지 */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">{error} (기본 데이터로 표시됩니다)</p>
          </div>
        )}

        {/* 감사 메시지 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">설문 완료!</h2>
          <p className="text-green-700">한 주 동안 고생하셨습니다. 소중한 의견 감사드립니다.</p>
        </div>

        {/* 그래프 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">주차별 우리팀의 추이</h3>
          
          {historicalData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">{question}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" fontSize={10} />
                      <YAxis domain={[1, 5]} fontSize={10} />
                      {/* count 표시 */}
                      <Tooltip 
                        formatter={(value, name) => [`${value?.toFixed(1)}`, `평점`]}
                        labelFormatter={(label, payload) => {
                          if (!payload || payload.length === 0) return label;
                          const count = payload[0].payload.count;
                          return `${convertDate(payload[0].payload.created_at)} (응답자: ${count}명)`;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={`q${index + 1}`} 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 의견 섹션 */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">팀원들의 의견</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">{text_questions[0]}</h4>
              <div className="space-y-3">
                {comments.improvement.length > 0 ? (
                  comments.improvement.map((comment, index) => (
                    <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <p className="text-sm text-gray-700">{comment.response} - {convertDate(comment.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">아직 의견이 없습니다.</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">{text_questions[1]}</h4>
              <div className="space-y-3">
                {comments.positive.length > 0 ? (
                  comments.positive.map((comment, index) => (
                    <div key={index} className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                      <p className="text-sm text-gray-700">{comment.response} - {convertDate(comment.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">아직 의견이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* 재시작 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/survey')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;