import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Rating from '@mui/material/Rating';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function NewsForm(props: any) {
  return (
    <Box component="form" onSubmit={props.handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="news"
        label="News"
        name="news"
        placeholder="Enter the news you wish to fact check here"
        multiline
        minRows={10}
        autoFocus
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Analyze
      </Button>
    </Box>
  );
}

function Result(props: any) {
  const { result, setResult } = props;
  const { bias, claims, fake } = result;

  return (
    <Box sx={{ mt: 1, width: "100%" }}>
      { bias && <>
        <Typography component="h3" variant="h4" sx={{ mt: 3 }}>
            Biased?
        </Typography>
        <Rating defaultValue={bias.bias_score * 5} precision={0.1} readOnly />
      </> }
      { fake && <>
        <Typography component="h3" variant="h4" sx={{ mt: 3 }}>
            {fake.label}?
        </Typography>
        <Rating defaultValue={fake.prob * 5} precision={0.1} readOnly />
      </> }
      { claims && <>
        <Typography component="h3" variant="h4" sx={{ mt: 3 }}>
            Claims
        </Typography>
        {claims.map((c: any) => {
          const { claim, possible_source, truthfulness } = c;
          return (<Box sx={{ m: 3 }}>
            <Typography component="p" sx={{ mt: 1 }}>
              Claim: {claim}
            </Typography>
            <Typography component="p" sx={{ mt: 1 }}>
              Possible Source: {possible_source}
            </Typography>
            <Typography component="p" sx={{ mt: 1 }}>
              Truthfulness: {truthfulness}
            </Typography>
          </Box>);
        })}
      </> }
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        onClick={() => setResult({})}
      >
        Analyze more
      </Button>
    </Box>
  );
}

const theme = createTheme();

export default function Home() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: FormData = new FormData(event.currentTarget);
    const news = data.get("news");
    
    setLoading(true);
    const apiResults = await Promise.all([
      postData("/predict-bias-score", { text: news }),
      postData("/extract-claims", { text: news }),
      postData("/predict-fake-news", { text: news }),
    ]);
    
    const result = {
      bias: apiResults[0],
      claims: apiResults[1],
      fake: apiResults[2]
    };

    setResult(result);
    setLoading(false);
  };

  async function postData(url = "", data = {}) {
    const foramttedUrl = `http://127.0.0.1:8000${url}`;

    try {
      const response = await fetch(foramttedUrl, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  const renderContent = () => {
    const noResult = Object.keys(result).length === 0;
    const content = noResult ? 
      loading ? <CircularProgress /> : <NewsForm handleSubmit={handleSubmit} /> 
      : <Result result={result} setResult={setResult} />;

    return content;
  }


  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <NewspaperIcon />
          </Avatar>
          <Typography component="h1" variant="h2">
            NewsWise
          </Typography>
          <Typography component="p" sx={{ mt: 3 }}>
            Stay Informed, Stay Aware
          </Typography>
          {renderContent()}
        </Box>
      </Container>
    </ThemeProvider>
  );
}