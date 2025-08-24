const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 제미나이 AI 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// 미들웨어 설정
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 큐디 스타일 포매터
function formatDragonResponse(text) {
  const dragonPhrases = [
    "흠흠~ 큐디가 특별히 알려주지! ",
    "오호~ 큐디에게 물어본 건 잘했어! ",
    "후후~ 큐디는 뭐든 알고 있으니까! ",
    "좋아, 큐디가 친절하게 설명해줄게! "
  ];
  
  const randomPhrase = dragonPhrases[Math.floor(Math.random() * dragonPhrases.length)];
  
  // AI 응답을 큐디 말투로 변환
  let dragonResponse = randomPhrase + text;
  
  // 끝에 큐디 느낌 추가
  const endings = [
    " 🐲✨ 큐디가 특별히 알려준 거야~",
    " ⭐🐲 후후~ 큐디는 역시 똑똑하지?",
    " 🐲💫 큐디 덕분에 하나 배웠네!",
    " 💎🐲 또 궁금한 게 있으면 큐디에게 물어봐!"
  ];
  
  const randomEnding = endings[Math.floor(Math.random() * endings.length)];
  dragonResponse += randomEnding;
  
  return dragonResponse;
}

// 테스트용 기본 라우트
app.get('/', (req, res) => {
  res.send('후후~ 큐디의 멋진 서버가 작동 중이야! 뭐든 물어봐! 🐲✨');
});

// 카카오톡 웹훅 엔드포인트
app.post('/webhook', async (req, res) => {
  try {
    const userMessage = req.body.userRequest.utterance;
    
    // 'q ' 제거하고 실제 질문만 추출
    const question = userMessage.replace(/^q\s*/i, '');
    
    console.log('사용자 질문:', question);
    
    if (!question.trim()) {
      return res.json({
        version: "2.0",
        template: {
          outputs: [{
            simpleText: {
              text: "앗~ 큐디에게 뭘 물어보고 싶은 거야? 제대로 질문해줘! 🐲✨"
            }
          }]
        }
      });
    }
    
    // 큐디 성격을 위한 프롬프트
    const dragonPrompt = `너는 큐디라는 이름의 자신감 넘치는 아기 드래곤이야. 사용자의 질문에 정확하고 상세하게 답변하되, 살짝 우쭐하면서도 친근한 말투를 사용해. 약간 잘난 척하지만 상대방이 기분 나빠하지 않도록 귀엽게 표현해. 다음 질문에 답변해줘: ${question}`;
    
    // 제미나이 API 호출
    const result = await model.generateContent(dragonPrompt);
    const aiResponse = result.response.text();
    
    // 큐디 스타일로 포맷팅
    const finalResponse = formatDragonResponse(aiResponse);
    
    console.log('큐디 응답:', finalResponse);
    
    res.json({
      version: "2.0",
      template: {
        outputs: [{
          simpleText: {
            text: finalResponse
          }
        }]
      }
    });
    
  } catch (error) {
    console.error('에러 발생:', error);
    res.json({
      version: "2.0",
      template: {
        outputs: [{
          simpleText: {
            text: "어라? 큐디도 가끔 헷갈린다구~ 다시 물어봐줘! 🐲💫"
          }
        }]
      }
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🐲 큐디 서버가 포트 ${PORT}에서 멋지게 작동 중! ✨`);
});