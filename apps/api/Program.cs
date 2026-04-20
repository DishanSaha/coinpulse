using CryptoPulse.API.Configuration;
using CryptoPulse.API.Services;
using CryptoPulse.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

//
//Configuration (CoinGecko options)
//
builder.Services.Configure<CoinGeckoOptions>(
    builder.Configuration.GetSection("CoinGecko")
);

//
//Typed HttpClient for CoinGecko
//
builder.Services.AddHttpClient<ICoinGeckoService, CoinGeckoService>(client =>
{
    client.BaseAddress = new Uri("https://api.coingecko.com/api/v3/");

    // IMPORTANT: CoinGecko may reject requests without this
    client.DefaultRequestHeaders.Add("User-Agent", "CryptoPulse-App");
});

//
//CORS configuration (ALLOW frontend on localhost:3000)
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//
//Controllers + Swagger
//
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//
//Swagger middleware
//
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//
//Pipeline
//
app.UseHttpsRedirection();

// IMPORTANT: CORS must be here (before MapControllers)
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();