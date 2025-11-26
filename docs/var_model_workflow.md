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
    
    Q --> R[Fit Final VAR Model<br/>with optimal lag order]
    R --> S[Model Diagnostics]
    S --> T[Test Residuals<br/>Autocorrelation, Normality]
    
    T --> U{Residuals<br/>White Noise?}
    U -->|No| V[Adjust Model<br/>Refine lag order]
    V --> R
    U -->|Yes| W[Granger Causality Test<br/>Analyze variable relationships]
    
    W --> X[Impulse Response Analysis<br/>IRF plots]
    X --> Y[Forecast Variance Decomposition<br/>FEVD analysis]
    
    Y --> Z[Generate Forecasts<br/>Out-of-sample predictions]
    Z --> AA[Evaluate Model Performance<br/>RMSE, MAE, MAPE]
    
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
    style Z fill:#e1f0ff
    style AE fill:#f0e1ff
:::

El diagrama utiliza colores para difrenciar las fases importantes
Verde para inicio
Rojo final
Amarillo pasos criticos para la creacion del modelado
azul para prediccion
morado resultados finales
