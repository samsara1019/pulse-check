import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, text_questions, options } from '../static/questions';
import { supabase } from '../lib/supabaseClient';

const SurveyPage = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    comment1: '',
    comment2: ''
  });


  const handleInputChange = (field, value) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_surveys')
        .insert([{
          ...surveyData,
          created_at: new Date().toISOString(),
          week: getCurrentWeek()
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
    
    navigate('/results');
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const week = Math.ceil((now.getDate() + (now.getDay() === 0 ? 7 : now.getDay())) / 7);
    return week;
  };

  const isFormValid = () => {
    return surveyData.q1 && surveyData.q2 && surveyData.q3 && 
           surveyData.q4 && surveyData.q5 && 
           surveyData.comment1.trim() && surveyData.comment2.trim();
  };


  return(
  <div className="min-h-screen bg-gray-50 py-8 px-4">
  <div className="max-w-2xl mx-auto">
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">익명 서베이 (펄스체크)</h2>
      
      {/* 객관식 질문들 */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {index + 1}. {question}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {options.map((option) => (
                <label key={option.value} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`q${index + 1}`}
                    value={option.value}
                    onChange={(e) => handleInputChange(`q${index + 1}`, e.target.value)}
                    className="mr-3 text-blue-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* 주관식 질문들 */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            6. {text_questions[0]}
          </h3>
          <textarea
            value={surveyData.comment1}
            onChange={(e) => handleInputChange('comment1', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="의견을 자유롭게 작성해주세요..."
          />
        </div>

        <div className="pb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            7. {text_questions[1]}
          </h3>
          <textarea
            value={surveyData.comment2}
            onChange={(e) => handleInputChange('comment2', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="의견을 자유롭게 작성해주세요..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${
            isFormValid() 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          제출하기
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default SurveyPage;