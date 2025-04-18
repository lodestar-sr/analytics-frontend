/**
 * Mock Business Analytics Backend
 *
 * A single-file Node.js server that simulates a GenAI business analytics backend.
 * It manages sessions and inquiries, and provides both REST and WebSocket endpoints.
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Initialize the Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
        res.statusCode
      } (${duration}ms)`
    );
  });
  next();
});

// In-memory data store
const sessions = {};
const inquiries = {};

// Mock data for responses
const mockBusinessData = {
  sales: [
    {
      month: "Jan",
      revenue: 45000,
      expenses: 32000,
      profit: 13000,
      region: "North",
    },
    {
      month: "Feb",
      revenue: 52000,
      expenses: 34000,
      profit: 18000,
      region: "North",
    },
    {
      month: "Mar",
      revenue: 61000,
      expenses: 36000,
      profit: 25000,
      region: "North",
    },
    {
      month: "Apr",
      revenue: 58000,
      expenses: 35000,
      profit: 23000,
      region: "North",
    },
    {
      month: "May",
      revenue: 63000,
      expenses: 37000,
      profit: 26000,
      region: "North",
    },
    {
      month: "Jun",
      revenue: 72000,
      expenses: 39000,
      profit: 33000,
      region: "North",
    },
    {
      month: "Jan",
      revenue: 38000,
      expenses: 28000,
      profit: 10000,
      region: "South",
    },
    {
      month: "Feb",
      revenue: 41000,
      expenses: 29000,
      profit: 12000,
      region: "South",
    },
    {
      month: "Mar",
      revenue: 45000,
      expenses: 31000,
      profit: 14000,
      region: "South",
    },
    {
      month: "Apr",
      revenue: 49000,
      expenses: 32000,
      profit: 17000,
      region: "South",
    },
    {
      month: "May",
      revenue: 51000,
      expenses: 33000,
      profit: 18000,
      region: "South",
    },
    {
      month: "Jun",
      revenue: 56000,
      expenses: 35000,
      profit: 21000,
      region: "South",
    },
  ],
  customers: [
    {
      id: 1,
      name: "Acme Corp",
      segment: "Enterprise",
      annualSpend: 120000,
      loyaltyYears: 5,
      lastPurchase: "2025-03-15",
    },
    {
      id: 2,
      name: "TechStart Inc",
      segment: "SMB",
      annualSpend: 45000,
      loyaltyYears: 2,
      lastPurchase: "2025-04-01",
    },
    {
      id: 3,
      name: "BigRetail",
      segment: "Enterprise",
      annualSpend: 210000,
      loyaltyYears: 7,
      lastPurchase: "2025-03-28",
    },
    {
      id: 4,
      name: "Local Shop",
      segment: "Small",
      annualSpend: 15000,
      loyaltyYears: 1,
      lastPurchase: "2025-02-10",
    },
    {
      id: 5,
      name: "MidMarket Solutions",
      segment: "SMB",
      annualSpend: 78000,
      loyaltyYears: 3,
      lastPurchase: "2025-03-22",
    },
    {
      id: 6,
      name: "Global Industries",
      segment: "Enterprise",
      annualSpend: 350000,
      loyaltyYears: 10,
      lastPurchase: "2025-04-05",
    },
    {
      id: 7,
      name: "Corner Cafe",
      segment: "Small",
      annualSpend: 9000,
      loyaltyYears: 2,
      lastPurchase: "2025-03-30",
    },
    {
      id: 8,
      name: "Tech Giants",
      segment: "Enterprise",
      annualSpend: 500000,
      loyaltyYears: 4,
      lastPurchase: "2025-04-10",
    },
  ],
  products: [
    {
      id: "P001",
      name: "Basic Plan",
      category: "Subscription",
      unitPrice: 29.99,
      monthlySales: [120, 125, 118, 130, 142, 155],
    },
    {
      id: "P002",
      name: "Premium Plan",
      category: "Subscription",
      unitPrice: 99.99,
      monthlySales: [45, 48, 52, 55, 60, 62],
    },
    {
      id: "P003",
      name: "Enterprise Solution",
      category: "Service",
      unitPrice: 599.99,
      monthlySales: [12, 15, 14, 18, 20, 22],
    },
    {
      id: "P004",
      name: "Data Package",
      category: "Add-on",
      unitPrice: 49.99,
      monthlySales: [67, 70, 65, 72, 80, 85],
    },
    {
      id: "P005",
      name: "API Access",
      category: "Add-on",
      unitPrice: 199.99,
      monthlySales: [28, 30, 32, 35, 40, 42],
    },
    {
      id: "P006",
      name: "Consulting Hours",
      category: "Service",
      unitPrice: 150.0,
      monthlySales: [50, 45, 48, 52, 55, 60],
    },
  ],
};

// Helper function to transform product data for time series if needed
function transformProductData(data, chartConfig) {
  // If we need to show monthly sales time series for products
  if (
    chartConfig &&
    chartConfig.xAxis &&
    chartConfig.xAxis.key === "month" &&
    Array.isArray(data)
  ) {
    // Only transform if we're dealing with product data that has monthlySales
    const hasMonthlyData = data.some((item) =>
      Array.isArray(item.monthlySales)
    );

    if (hasMonthlyData) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const transformedData = [];

      // Create a data point for each month
      for (let i = 0; i < months.length; i++) {
        const dataPoint = { month: months[i] };

        // Add sales data for each product
        data.forEach((product) => {
          if (
            product &&
            product.name &&
            Array.isArray(product.monthlySales) &&
            i < product.monthlySales.length
          ) {
            dataPoint[product.name] = product.monthlySales[i];
          }
        });

        transformedData.push(dataPoint);
      }

      return transformedData;
    }
  }

  // If no transformation needed or if there's an issue, return original data
  return data;
}

const tableTypes = ["sales", "customers", "products"];
const chartTypes = ["bar", "line", "multiBar", "multiLine", "pie"];

// Helper function to generate mock SQL based on the question
function generateMockSQL(question) {
  const questionLower = question.toLowerCase();
  let table = tableTypes[Math.floor(Math.random() * tableTypes.length)];

  // Try to match the question to a table type
  if (
    questionLower.includes("sales") ||
    questionLower.includes("revenue") ||
    questionLower.includes("profit")
  ) {
    table = "sales";
  } else if (
    questionLower.includes("customer") ||
    questionLower.includes("client")
  ) {
    table = "customers";
  } else if (
    questionLower.includes("product") ||
    questionLower.includes("subscription")
  ) {
    table = "products";
  }

  // Generate SQL based on the table
  switch (table) {
    case "sales":
      return `SELECT month, revenue, expenses, profit, region FROM sales WHERE region IN ('North', 'South') ORDER BY month ASC`;
    case "customers":
      return `SELECT name, segment, annualSpend, loyaltyYears FROM customers ORDER BY annualSpend DESC`;
    case "products":
      return `SELECT id, name, category, unitPrice FROM products ORDER BY unitPrice ASC`;
    default:
      return `SELECT * FROM ${table} LIMIT 10`;
  }
}

// Helper function to determine appropriate chart type and axes based on data
function determineChartType(table) {
  let chartType;
  let chartConfig = {
    xAxis: {
      key: "",
      label: "",
    },
    yAxes: [],
  };

  switch (table) {
    case "sales":
      chartType = Math.random() > 0.5 ? "multiLine" : "multiBar";
      chartConfig.xAxis.key = "month";
      chartConfig.xAxis.label = "Month";
      chartConfig.yAxes = [
        { key: "revenue", label: "Revenue ($)", color: "#8884d8" },
        { key: "expenses", label: "Expenses ($)", color: "#82ca9d" },
        { key: "profit", label: "Profit ($)", color: "#ffc658" },
      ];
      break;

    case "customers":
      chartType = Math.random() > 0.5 ? "bar" : "pie";
      if (chartType === "bar") {
        chartConfig.xAxis.key = "name";
        chartConfig.xAxis.label = "Customer";
        chartConfig.yAxes = [
          { key: "annualSpend", label: "Annual Spend ($)", color: "#8884d8" },
        ];
      } else {
        // For pie charts
        chartConfig.xAxis.key = "name";
        chartConfig.xAxis.label = "Customer";
        chartConfig.yAxes = [
          { key: "annualSpend", label: "Annual Spend ($)", color: "#8884d8" },
        ];
      }
      break;

    case "products":
      chartType = Math.random() > 0.5 ? "bar" : "line";
      chartConfig.xAxis.key = "name";
      chartConfig.xAxis.label = "Product";
      chartConfig.yAxes = [
        { key: "unitPrice", label: "Unit Price ($)", color: "#8884d8" },
      ];

      // For products with monthly sales, sometimes use that data instead
      if (chartType === "line" && Math.random() > 0.5) {
        chartType = "multiLine";
        chartConfig.xAxis.key = "month";
        chartConfig.xAxis.label = "Month";

        // We'll transform the data later for time series display
        chartConfig.yAxes = [
          { key: "sales", label: "Monthly Sales", color: "#8884d8" },
        ];
      }
      break;

    default:
      chartType = chartTypes[Math.floor(Math.random() * chartTypes.length)];
      // Generic config
      const numericKeys = Object.keys(mockBusinessData[table][0])
        .filter((key) => typeof mockBusinessData[table][0][key] === "number")
        .slice(0, 3);

      const nonNumericKeys = Object.keys(mockBusinessData[table][0])
        .filter((key) => typeof mockBusinessData[table][0][key] !== "number")
        .slice(0, 1);

      chartConfig.xAxis.key = nonNumericKeys[0] || "";
      chartConfig.xAxis.label = nonNumericKeys[0] || "";
      chartConfig.yAxes = numericKeys.map((key, idx) => {
        const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
        return {
          key: key,
          label: key,
          color: colors[idx % colors.length],
        };
      });
  }

  return {
    chartType,
    chartConfig,
  };
}

// Helper function to generate textual answer
function generateTextualAnswer(question, table) {
  switch (table) {
    case "sales":
      return "Based on our analysis, sales revenue has shown a consistent growth trend over the first half of the year, with the North region outperforming the South. The profit margins appear to be improving month-over-month, with June showing the highest profitability. This suggests that our cost management strategies are working effectively alongside revenue growth.";
    case "customers":
      return "The customer data reveals that Enterprise segment clients generate the highest annual spend, with Global Industries being our top customer. However, we should note that SMB clients are growing in number and represent a significant opportunity for expansion. Customer loyalty appears to correlate positively with annual spend, suggesting we should focus on retention strategies for high-value accounts.";
    case "products":
      return "Our product analysis indicates that subscription-based offerings generate the most consistent revenue stream. The Basic Plan has the highest volume of sales, while the Enterprise Solution, despite lower volume, contributes significantly to revenue due to its higher price point. Monthly sales trends show growth across all product categories, with Premium Plan showing the most promising growth trajectory.";
    default:
      return "Based on the data analysis, we can see several important trends that align with business objectives. The metrics show positive movement in key areas, though there are opportunities for optimization in certain segments. Further analysis may be required to make specific recommendations.";
  }
}

// Routes

// Create a new session
app.post("/api/sessions", (req, res) => {
  const sessionId = uuidv4();
  sessions[sessionId] = {
    id: sessionId,
    created: new Date(),
    inquiries: [],
  };

  res.status(201).json({ sessionId });
});

// Get session details
app.get("/api/sessions/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json(sessions[sessionId]);
});

// Submit a new inquiry
app.post("/api/sessions/:sessionId/inquiries", (req, res) => {
  const { sessionId } = req.params;
  const { question } = req.body;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const inquiryId = uuidv4();
  const inquiry = {
    id: inquiryId,
    sessionId,
    question,
    status: "created",
    created: new Date(),
    updated: new Date(),
  };

  inquiries[inquiryId] = inquiry;
  sessions[sessionId].inquiries.push(inquiryId);

  // Start background processing
  processInquiry(inquiryId);

  res.status(202).json({ inquiryId });
});

// Get inquiry status and details
app.get("/api/inquiries/:inquiryId", (req, res) => {
  const { inquiryId } = req.params;

  if (!inquiries[inquiryId]) {
    return res.status(404).json({ error: "Inquiry not found" });
  }

  res.json(inquiries[inquiryId]);
});

// Stream inquiry answer
app.get("/api/inquiries/:inquiryId/stream", (req, res) => {
  const { inquiryId } = req.params;

  if (!inquiries[inquiryId]) {
    console.log(
      `[${new Date().toISOString()}] Stream request failed: Inquiry ${inquiryId} not found`
    );
    return res.status(404).json({ error: "Inquiry not found" });
  }

  const inquiry = inquiries[inquiryId];

  if (inquiry.status !== "done") {
    console.log(
      `[${new Date().toISOString()}] Stream request failed: Inquiry ${inquiryId} not complete (status: ${
        inquiry.status
      })`
    );
    return res.status(400).json({ error: "Inquiry processing not complete" });
  }

  console.log(
    `[${new Date().toISOString()}] Starting stream for inquiry ${inquiryId}`
  );

  // Set headers for streaming
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  // Stream the answer character by character with small delays
  const answer = inquiry.textualAnswer;
  let index = 0;
  let lastLoggedPercent = 0;

  console.log(
    `[${new Date().toISOString()}] Stream started: ${
      answer.length
    } characters to stream`
  );

  const stream = setInterval(() => {
    if (index < answer.length) {
      res.write(answer[index]);
      index++;

      // Log progress at 25%, 50%, 75% and 100%
      const percent = Math.floor((index / answer.length) * 100);
      if (percent >= lastLoggedPercent + 25) {
        lastLoggedPercent = percent - (percent % 25);
        console.log(
          `[${new Date().toISOString()}] Stream progress: ${lastLoggedPercent}% (${index}/${
            answer.length
          } characters)`
        );
      }
    } else {
      clearInterval(stream);
      res.end();
      console.log(
        `[${new Date().toISOString()}] Stream completed for inquiry ${inquiryId}`
      );
    }
  }, 50); // 50ms delay between characters
});

// Background processing function
async function processInquiry(inquiryId) {
  const inquiry = inquiries[inquiryId];

  console.log(
    `[${new Date().toISOString()}] Starting inquiry processing: ${inquiryId}`
  );

  // Update status to processing
  inquiry.status = "processing";
  inquiry.updated = new Date();
  emitInquiryUpdate(inquiry);
  console.log(
    `[${new Date().toISOString()}] Inquiry ${inquiryId} status updated to: processing`
  );

  // Simulate time frame identification (1-2 seconds)
  const timeFrameDelay = 1000 + Math.random() * 1000;
  console.log(
    `[${new Date().toISOString()}] Simulating time frame identification for ${timeFrameDelay.toFixed(
      0
    )}ms`
  );
  await sleep(timeFrameDelay);
  inquiry.timeFrame = "Last 6 months";
  inquiry.updated = new Date();
  emitInquiryUpdate(inquiry);
  console.log(
    `[${new Date().toISOString()}] Inquiry ${inquiryId} time frame set to: ${
      inquiry.timeFrame
    }`
  );

  // Simulate SQL generation (2-3 seconds)
  const sqlDelay = 2000 + Math.random() * 1000;
  console.log(
    `[${new Date().toISOString()}] Simulating SQL generation for ${sqlDelay.toFixed(
      0
    )}ms`
  );
  await sleep(sqlDelay);
  const table = tableTypes[Math.floor(Math.random() * tableTypes.length)];
  inquiry.sql = generateMockSQL(inquiry.question);
  inquiry.updated = new Date();
  emitInquiryUpdate(inquiry);
  console.log(
    `[${new Date().toISOString()}] Inquiry ${inquiryId} SQL generated: ${inquiry.sql.substring(
      0,
      50
    )}...`
  );
  console.log(`[${new Date().toISOString()}] Selected table type: ${table}`);

  // Simulate data retrieval (1-2 seconds)
  const dataDelay = 1000 + Math.random() * 1000;
  console.log(
    `[${new Date().toISOString()}] Simulating data retrieval for ${dataDelay.toFixed(
      0
    )}ms`
  );
  await sleep(dataDelay);

  // Get raw data and potentially transform it based on the table type
  let rawData = mockBusinessData[table];

  try {
    // Get chart info first so we can use it for potential data transformation
    const chartInfo = determineChartType(table);
    console.log(
      `[${new Date().toISOString()}] Selected chart type: ${
        chartInfo.chartType
      }`
    );

    // Transform data if needed (particularly for product monthly sales)
    inquiry.tableData = transformProductData(rawData, chartInfo.chartConfig);
    inquiry.chartType = chartInfo.chartType;
    inquiry.chartConfig = chartInfo.chartConfig;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error processing data:`,
      error
    );
    // Fallback to raw data without transformation
    inquiry.tableData = rawData;
    inquiry.chartType = "bar"; // Default chart type
    inquiry.chartConfig = {
      xAxis: {
        key: Object.keys(rawData[0])[0],
        label: Object.keys(rawData[0])[0],
      },
      yAxes: [
        {
          key: Object.keys(rawData[0])[1],
          label: Object.keys(rawData[0])[1],
          color: "#8884d8",
        },
      ],
    };
  }

  inquiry.updated = new Date();
  emitInquiryUpdate(inquiry);
  console.log(
    `[${new Date().toISOString()}] Inquiry ${inquiryId} data retrieved: ${
      inquiry.tableData.length
    } rows`
  );
  console.log(
    `[${new Date().toISOString()}] Chart type set to: ${inquiry.chartType}`
  );
  console.log(
    `[${new Date().toISOString()}] Chart config: X-Axis: ${
      inquiry.chartConfig.xAxis.key
    }, Y-Axes: ${inquiry.chartConfig.yAxes.map((y) => y.key).join(", ")}`
  );

  // We don't need a separate chart determination step since we already did it
  await sleep(500); // Small delay for better UX
  // Simulate textual answer generation (2-3 seconds)
  const answerDelay = 2000 + Math.random() * 1000;
  console.log(
    `[${new Date().toISOString()}] Generating textual answer for ${answerDelay.toFixed(
      0
    )}ms`
  );
  await sleep(answerDelay);
  inquiry.textualAnswer = generateTextualAnswer(inquiry.question, table);
  console.log(`Answer text: ${generateTextualAnswer(inquiry.question, table)}`);
  inquiry.status = "done";
  inquiry.updated = new Date();
  emitInquiryUpdate(inquiry);
  console.log(
    `[${new Date().toISOString()}] Inquiry ${inquiryId} completed with status: ${
      inquiry.status
    }`
  );
  console.log(
    `[${new Date().toISOString()}] Answer length: ${
      inquiry.textualAnswer.length
    } characters`
  );
}

// Helper function to emit WebSocket events
function emitInquiryUpdate(inquiry) {
  io.emit("inquiry_updated", inquiry);
  console.log(
    `[${new Date().toISOString()}] WebSocket: Emitted inquiry_updated event for inquiry ${
      inquiry.id
    }`
  );
}

// Helper function to simulate async delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(
    `[${new Date().toISOString()}] WebSocket: Client connected, ID: ${
      socket.id
    }`
  );

  // Log all active connections
  const connectedClients = io.sockets.sockets.size;
  console.log(
    `[${new Date().toISOString()}] WebSocket: Total connected clients: ${connectedClients}`
  );

  socket.on("disconnect", () => {
    console.log(
      `[${new Date().toISOString()}] WebSocket: Client disconnected, ID: ${
        socket.id
      }`
    );
  });
});

// API endpoint monitoring
app.post("/api/sessions", (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Creating new session`);
  next();
});

app.post("/api/sessions/:sessionId/inquiries", (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] New inquiry submitted for session ${
      req.params.sessionId
    }: "${req.body.question}"`
  );
  next();
});

app.get("/api/inquiries/:inquiryId/stream", (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Streaming request for inquiry ${
      req.params.inquiryId
    }`
  );
  next();
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server started on port ${PORT}`);
  console.log(
    `[${new Date().toISOString()}] REST API available at http://localhost:${PORT}/api`
  );
  console.log(
    `[${new Date().toISOString()}] WebSocket server running on ws://localhost:${PORT}`
  );
  console.log("--------------------------------------------------------------");
  console.log("Available endpoints:");
  console.log("POST /api/sessions - Create a new session");
  console.log("GET /api/sessions/:sessionId - Get session details");
  console.log("POST /api/sessions/:sessionId/inquiries - Submit a new inquiry");
  console.log("GET /api/inquiries/:inquiryId - Get inquiry status and details");
  console.log("GET /api/inquiries/:inquiryId/stream - Stream the answer");
  console.log("--------------------------------------------------------------");
});
