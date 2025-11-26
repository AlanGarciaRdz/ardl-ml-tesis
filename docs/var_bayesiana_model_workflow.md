::: mermaid
graph TD
    A[Start: Data Collection] --> B[Import Libraries<br/>pandas, numpy, statsmodels, matplotlib]
    B --> C[Load and Prepare Data]
    C --> D[Exploratory Data Analysis<br/>Visualize time series]
    
    D --> E{Check for<br/>Missing Values?}
    E -->|Yes| F[Handle Missing Data<br/>Imputation/Removal]
    E -->|No| G[Test for Stationarity<br/>ADF Test for each series]
    F --> G
    
    G --> H{All Series<br/>Stationary?}
    H -->|No| I[Apply Differencing<br/>d-order integration]
    I --> J[Re-test Stationarity]
    J --> H
    H -->|Yes| K[Cointegration Test<br/>Johansen Test]
    
    K --> L{Series<br/>Cointegrated?}
    L -->|No| M[Consider Alternative Models<br/>or Transformations]
    L -->|Yes| N[Model Selection<br/>Determine Optimal Lag Order]
    
    N --> O[Iteratively Fit VAR Models<br/>with different lag orders p]
    O --> P[Compare Information Criteria<br/>AIC, BIC, HQIC, FPE]
    P --> Q[Select Best Model<br/>Lowest AIC/BIC]
    
    Q --> Q1{Select<br/>Estimation Method}
    Q1 -->|Classical| R[Fit VAR Model - OLS<br/>Maximum Likelihood]
    Q1 -->|Bayesian| R1[Fit Bayesian VAR - BVAR<br/>MCMC/Gibbs Sampling]
    
    R1 --> R2[Specify Prior Distributions<br/>Minnesota/Normal-Wishart priors]
    R2 --> R3[Posterior Inference<br/>Parameter estimation with uncertainty]
    R3 --> R4[Convergence Diagnostics<br/>Trace plots, Gelman-Rubin]
    R4 --> S1{Chains<br/>Converged?}
    S1 -->|No| R5[Adjust MCMC settings<br/>Increase iterations/chains]
    R5 --> R1
    S1 -->|Yes| S[Model Diagnostics]
    
    R --> S
    S --> T[Test Residuals<br/>Autocorrelation, Normality]
    
    T --> U{Residuals<br/>White Noise?}
    U -->|No| V[Adjust Model<br/>Refine lag order]
    V --> R
    U -->|Yes| W[Granger Causality Test<br/>Analyze variable relationships]
    
    W --> X[Impulse Response Analysis<br/>IRF plots]
    X --> Y[Forecast Variance Decomposition<br/>FEVD analysis]
    
    Y --> Z{Forecasting<br/>Approach}
    Z -->|Point Forecasts| Z1[Generate Forecasts<br/>Out-of-sample predictions]
    Z -->|Bayesian Forecasts| Z2[Bayesian Predictive Distribution<br/>Credible intervals & density forecasts]
    
    Z1 --> AA[Evaluate Model Performance<br/>RMSE, MAE, MAPE]
    Z2 --> AA1[Evaluate Probabilistic Forecasts<br/>Log Score, CRPS, Coverage]
    AA1 --> AA
    
    AA --> AB{Performance<br/>Satisfactory?}
    AB -->|No| AC[Model Refinement<br/>Review transformations]
    AC --> N
    AB -->|Yes| AD[Inverse Transformation<br/>Roll back differencing if applied]
    
    AD --> AE[Final Results<br/>Interpretation & Reporting]
    AE --> AF[End: Deploy Model<br/>or Further Analysis]
    
    style A fill:#e1f5e1
    style AF fill:#ffe1e1
    style Q fill:#fff4e1
    style R fill:#fff4e1
    style Q1 fill:#ffd4e1
    style R1 fill:#ffd4e1
    style R2 fill:#ffd4e1
    style R3 fill:#ffd4e1
    style Z2 fill:#d4f1ff
    style AE fill:#f0e1ff
:::