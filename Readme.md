# **SakuNusa Machine Learning** 

## **API Specification**  

### **Base URL**  
```
https://sakunusaml-1043929878203.asia-southeast2.run.app
```
### **Endpoint: Anomali detect**  
#### **Request**  
**Method:** `POST`  
**URL:** `/anomali/`

**Request Format**
| field        | Type   | Required | Example | 
|--------------|--------|----------|---------|
| input_amount | float  | Yes      | 3000000 |   

---
#### **Response**  

**Status Code:** `200 OK`  

**Content-Type:** `application/json`  

**Response Body:**  
```json
{
    "Date": "2024-12-12",
    "Amount": 3000000.0,
    "Loss": 0.10576264174847767,
    "Anomaly Detected": true
}
```
---
