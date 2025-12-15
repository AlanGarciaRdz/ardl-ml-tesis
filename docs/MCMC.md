Referencias directas

Robert & Casella — Monte Carlo Statistical Methods, capítulo 6

Gelman et al. — Bayesian Data Analysis, sección sobre MCMC

Wikipedia – Metropolis–Hastings algorithm
https://en.wikipedia.org/wiki/Metropolis–Hastings_algorithm

Ejemplos académicos típicos como:

Hastings (1970)

Metropolis (1953)

1. Start at θ₀
2. Generate proposal θ* from some q(θ* | θ)
3. Compute ratio r = p(θ*) / p(θ)
4. Accept with probability min(1, r)
5. Repeat

p(θ) = log-verosimilitud del ARIMA (más prior si quieres)

q es una caminata aleatoria normal: θ* = θ + ruido


https://www.kaggle.com/code/equinxx/stock-prediction-using-3-methods-lstm-arima-mcmc LSTM + ARIMA  + MCMC