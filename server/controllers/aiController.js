import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

//controller for enhancing a resume's professional summary
//POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary=async(req,res)=>{
    try {
        const {userContent}=req.body;

        if(!userContent){
            return res.status(400).json({message:'Missing required fields'});
        }

        const response=await ai.chat.completions.create({
            model:process.env.OPENAI_MODEL,
            messages: [
            {   
                role: "system",
                content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objecttives. Make it compelling and ATS-friendly. and only return text no options or anything else." 
            },
            {
                role: "user",
                content: userContent,
            },
    ],
        })

        const enhancedContent=response.choices[0].message.content;
        return res.status(200).json({enhancedContent});
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
}

//controller for enhancing a resume's job description
//POST: /api/ai/enhance-job-desc
export const enhanceJobDescription=async(req,res)=>{
    try {
        const {userContent}=req.body;

        if(!userContent){
            return res.status(400).json({message:'Missing required fields'});
        }

        const response=await ai.chat.completions.create({
            model:process.env.OPENAI_MODEL,
            messages: [
            {   
                role: "system",
                content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilites and achievements. Use action verbs and quatifiable results where possible.Make it ATS-friendly. and only return text no options or anything else." 
            },
            {
                role: "user",
                content: userContent,
            },
    ],
        })

        const enhancedContent=response.choices[0].message.content;
        return res.status(200).json({enhancedContent});
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
}

//controller for uploading a resume to the database
//POST: /api/ai/upload-resume
export const uploadResume=async(req,res)=>{
    try {
        const {resumeText,title}=req.body;
        const userId=req.userId;

        if(!resumeText){
            return res.status(400).json({message:'Missing required fields'});
        }

        const systemPrompt="You are an expert AI Agent that extracts structured information from resume text.";

        const userPrompt=`Extract the following information from this resume text: ${resumeText}
        
        Provide the data in valid JSON format with the following structure. Use empty strings or empty arrays if information is missing:

        {
            "professional_summary": "string",
            "skills": ["string"],
            "personal_info": {
                "full_name": "string",
                "profession": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "linkedIn": "string",
                "website": "string"
            },
            "experience": [
                {
                    "company": "string",
                    "position": "string",
                    "start_date": "string",
                    "end_date": "string",
                    "description": "string",
                    "is_current": boolean
                }
            ],
            "projects": [
                {
                    "name": "string",
                    "type": "string",
                    "description": "string"
                }
            ],
            "education": [
                {
                    "institution": "string",
                    "degree": "string",
                    "field": "string",
                    "graduation_date": "string",
                    "gpa": "string"
                }
            ]
        }
        `;

        console.log("Starting AI Extraction with model:", process.env.OPENAI_MODEL);
        const response=await ai.chat.completions.create({
            model:process.env.OPENAI_MODEL,
            messages: [
            {   
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        })

        let extractedData=response.choices[0].message.content;
        console.log("AI Extraction Raw Response:", extractedData);

        try {
            // Remove potential markdown code blocks if present
            if (extractedData.includes('```json')) {
                extractedData = extractedData.split('```json')[1].split('```')[0];
            } else if (extractedData.includes('```')) {
                extractedData = extractedData.split('```')[1].split('```')[0];
            }
            
            const parsedData = JSON.parse(extractedData.trim());
            const newResume = await Resume.create({ userId, title, ...parsedData });
            return res.json({ resumeId: newResume._id });
        } catch (parseError) {
            console.error("AI Extraction Parsing Error:", extractedData);
            return res.status(500).json({ 
                message: "AI returned an invalid data format during extraction. Please try again.",
                error: parseError.message 
            });
        }
    } catch (error) {
        console.error("Upload Resume AI Error:", error.message, error.stack);
        return res.status(400).json({message:error.message});
    }
}

//controller for analyzing a resume for ATS score and feedback
//POST: /api/ai/analyze-resume
export const analyzeResume=async(req,res)=>{
    try {
        const {resumeText}=req.body;

        if(!resumeText){
            return res.status(400).json({message:'Missing required fields'});
        }

        const systemPrompt="You are an expert ATS (Applicant Tracking System) specialist and resume auditor.";

        const userPrompt=`Analyze the following resume text for ATS compatibility and overall quality. 
        Provide an ATS score (0-100), a list of strengths, a list of weaknesses, and actionable suggestions for improvement.

        Resume Text: ${resumeText}
        
        Provide the analysis in the following JSON format with no additional text:
        {
            "ats_score": number,
            "strengths": [string],
            "weaknesses": [string],
            "suggestions": [string],
            "summary": string
        }
        `;

        console.log("Starting AI Analysis with model:", process.env.OPENAI_MODEL);
        const response=await ai.chat.completions.create({
            model:process.env.OPENAI_MODEL,
            messages: [
            {   
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        })

        let analysisData=response.choices[0].message.content;
        console.log("AI Raw Response:", analysisData);
        
        try {
            // Remove potential markdown code blocks if present
            if (analysisData.includes('```json')) {
                analysisData = analysisData.split('```json')[1].split('```')[0];
            } else if (analysisData.includes('```')) {
                analysisData = analysisData.split('```')[1].split('```')[0];
            }
            return res.json(JSON.parse(analysisData.trim()));
        } catch (parseError) {
            console.error("AI Response Parsing Error:", analysisData);
            return res.status(500).json({ 
                message: "AI returned an invalid response format. Please try again.",
                error: parseError.message 
            });
        }
    } catch (error) {
        console.error("Analyze Resume Error:", error.message, error.stack);
        return res.status(400).json({message:error.message});
    }
}