import React, { useState, useEffect } from 'react';
import { Star, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "/workspaces/feedbackform/feedback-app/src/components/ui/card";
import Papa from 'papaparse';

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [isHappy, setIsHappy] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    const savedFeedback = localStorage.getItem('clientFeedback');
    if (savedFeedback) {
      setFeedbackHistory(JSON.parse(savedFeedback));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newFeedback = {
      name,
      isHappy,
      rating,
      feedback,
    };
  
    try {
      // Replace 'YOUR_WEB_APP_URL' with the actual URL of your Google Apps Script Web App
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzo_ONk9f3FMvyXElfUUq1BUV9ggu1i9-tJJn5kcm1uF9nOTZP9XF6MQTdVzeDpAyNofg/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newFeedback), // Send the actual data from form state
        }
      );
  
      if (!response.ok) {
        // If the response is not successful, log the error response
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to submit feedback');
      }
  
      const responseData = await response.json();
      console.log('Response Data:', responseData);
  
      // Add the new feedback to the local state and storage
      const updatedHistory = [
        ...feedbackHistory,
        { ...newFeedback, timestamp: new Date().toISOString() },
      ];
      setFeedbackHistory(updatedHistory);
      localStorage.setItem('clientFeedback', JSON.stringify(updatedHistory));
  
      // Mark the form as successfully submitted
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error.message);
  
      // Always go to the success page regardless of the error
      setSubmitted(true);
    }
  };
  const downloadCSV = () => {
    if (feedbackHistory.length === 0) return;

    const csv = Papa.unparse(feedbackHistory);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `happiness_feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ratingLabels = {
    1: 'Very Dissatisfied',
    2: 'Dissatisfied',
    3: 'Neutral',
    4: 'Satisfied',
    5: 'Very Satisfied',
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Thank You for Your Feedback!</h2>
            <p className="text-gray-600 mb-6">Your response has been recorded.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Submit Another Response
            </button>
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Feedback (CSV)
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">Feedback Form</CardTitle>
        {feedbackHistory.length > 0 && (
          <div className="text-right">
            <button
              onClick={downloadCSV}
              className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Feedback ({feedbackHistory.length} responses)
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Are you satisfied with the bouquet?</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="happiness"
                  value="yes"
                  checked={isHappy === 'yes'}
                  onChange={(e) => setIsHappy(e.target.value)}
                  required
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="happiness"
                  value="no"
                  checked={isHappy === 'no'}
                  onChange={(e) => setIsHappy(e.target.value)}
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hover || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">{ratingLabels[rating]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Comments
            </label>
            <textarea
              className="w-full p-3 border rounded-md min-h-32"
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
