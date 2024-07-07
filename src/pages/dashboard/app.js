// next
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
// @mui
import { Container, Stack, Button, TextField, Box, Typography } from '@mui/material';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import { useSnackbar  } from '../../components/snackbar';
import Iconify from '../../components/iconify';
// constants
import { appData } from '../../_mock/appData';

// ----------------------------------------------------------------------

GeneralAppPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GeneralAppPage() {
  const [messages, setMessages] = useState([
    { sender: 'ai', content: 'How can i assist you?' },
    { sender: 'me', content: 'Search for sick leave policy' },
    { sender: 'me', content: 'Search for Mergeflow Design Files' },
    { sender: 'me', content: 'Search for Mergeflow documents' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      setMessages([
        ...messages,
        {
          content: input,
          timestamp: new Date(),
          sender: 'me',
        },
      ]);
      setInput('');
    }
  };


  const { themeStretch } = useSettingsContext();

  const scrollToTop = () => {
    messagesEndRef.current?.scrollTo({ behavior: 'smooth', top: 0, });
  };

  const handleDocumentClick = () => {
    const message = `This feature is still in progress`;
    enqueueSnackbar(message, { variant: 'info' });

  }

  useEffect(scrollToTop, [messages]);
  const handleSendMessage = () => {
    if (input.length > 3) {
      setMessages([
        ...messages,
        {
          content: input,
          timestamp: new Date(),
          sender: 'me',
        },
      ]);
      setInput('');
    }
  };
  return (
    <>
      <Head>
        <title> General: App | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {appData && appData.map(item => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      width: '400px',
                      padding: '10px 25px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                      gap: '5px',
                      borderRadius: '15px',
                      border: '1px solid #ABDFD6',
                      background: '#F7FFFE',
                      m: 2,
                    }}
                  >
                    <Typography
                      alignSelf="flex-start"
                      sx={{
                        color: '#3EC0A9',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        lineHeight: '29px' /* 161.111% */,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#3EC0A9',
                        fontSize: '13px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        lineHeight: '19px' /* 161.111% */,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.desc}
                    </Typography>
                    <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center", gap: '2px' }}>
                      <Button onClick={handleDocumentClick}>
                        <Typography
                          sx={{
                            color: '#3EC0A9',
                            fontSize: '12px',
                            fontStyle: 'normal',
                            fontWeight: '400',
                            lineHeight: '22px',
                            textDecorationLine: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          {item.buttonText}
                        </Typography>
                        <Iconify 
                          icon="eva:external-link-fill" 
                          width={16}
                          sx={{
                            color: '#3EC0A9',
                            fontSize: '12px',
                            fontStyle: 'normal',
                            fontWeight: '400',
                            lineHeight: '22px',
                            textDecorationLine: 'underline',
                            cursor: 'pointer'
                          }}
                        />
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Box>

              {messages.map((message, i) => (
                <Box
                  key={i}
                  sx={{
                    maxWidth: '60%',
                    m: 1,
                    padding: '10px 20px',
                    paddingTop: message.sender === 'me' ? '' : '18px',
                    bgcolor: message.sender === 'me' ? '#fff' : '#F6F8FA',
                    border: message.sender === 'me' ? '1px solid' : '',
                    borderColor: message.sender === 'me' ? '#ABDFD6' : '',
                    borderRadius: '15px',
                    alignSelf: message.sender === 'me' ? 'flex-end' : 'flex-start',
                    position: 'relative',
                  }}
                >
                  {message.sender !== 'me' && (
                    <Box sx={{ position: 'absolute', bottom: '37px' }}>
                      <Image src="/assets/images/mind.svg" alt="Mind Image" width={24} height={24} />
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      color: message.sender === 'me' ? '#3EC0A9' : '#000',
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              ))}
            </Box>
            <div ref={messagesEndRef} />
          </Box>
          <Stack direction="column">
            <Box
              sx={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                position: 'relative',
              }}
            >
              <TextField
                sx={{
                  width: '90%',
                  borderRadius: '15px',
                  boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.12);',
                  outline: 'none',
                  border: 'none',
                }}
                placeholder="Type Search a Query"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleInputKeyPress}
              />
              <Box onClick={handleDocumentClick}>
                <Image
                  src="/assets/images/send.svg"
                  alt="Send Image"
                  style={{ position: 'relative', right: '3.5rem', cursor: 'pointer' }}
                  onClick={handleSendMessage}
                  width={24} height={24}
                />
              </Box>
              <Box
                sx={{
                  borderRadius: '15px',
                  boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.12);',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image src="/assets/images/clock.svg" alt="Clock Image" width={24} height={24} />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
