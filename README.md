# 구조
project-root/
│
├── config/
│   └── environment.js
├── handler/
│   ├── guildMember/
│   │   ├── guildMemberAdd.js
│   │   ├── guildMemberRemove.js
│   │   └── guildMemberUpdate.js
│   ├── inviteHistory.js
│   ├── manageTicket/
│   │   ├── manageRequest.js
│   │   ├── manageNickname.js
│   │   └── deleteHandler.js
│   ├── message/
│   │   ├── messageDelete.js
│   │   └── messageUpdate.js
│   ├── reaction/
│   │   ├── messageReactionAdd.js
│   │   └── messageReactionRemove.js
│   ├── noticeNicknameUser.js
│   ├── ready.js
│   ├── voice/
│   │   └── manageHistoryVoice.js
│   └── youtube/
│       └── noticeYoutube.js
├── utils/
│   └── log.js
├── index.js
└── package.json



# ENV 설명리스트

# 권한관련 기본
## Discord Token
### Discord Bot 의 Token 입력

## Discord AdminID
### Discord 관리자 역할의 ID

## Discord GuildID 
### Discord 서버의 ID 값 입력

## Discord MainChannel ID
### Discord 의 메인 문의채널 ID 입력
#### 해당 채널에서는 관리자에게 문의할 수 있는 Ticket을 생성하고, 이를 관리자가 처리할 수 있음.

## DISCORD ADMINCATEGORY
### 티켓이 메인 문의채널 문의 발생시 생성되는 채널 카테고리 





# 채널관련

## Discord History Channel
### 역할관련 로그기록 저장 채널

## Discord HistoryVoicechannel 
### Discord 음성채널 로그기록을 저장하는 채널

## Discord MessageLog Channel
### 메시지 로그 채널


## DiscordCreateVoiceChannelID
### 음성채널을 생성하는 특수채널


## DISCORD YOUTUBEPC/MO
### 각각의 유투브 PC/Mobile 디스코드 채널

DISCORD_CREATEVOICECHANNELID=1265116989265809530

YOUTUBE_APIKEY=AIzaSyB8wO11HUWIHZ1F0B8e0rma5-UVWNrpVBA
YOUTUBE_APIKEYBackup=AIzaSyBQLkYX6lRz1YN7Y0H19SFBQ2RVaZ6o7OA

DISCORD_YOUTUBEPC=1264848961760399381
DISCORD_YOUTUBEMO=1264848990508154962

LOSTARK_PC=UCL3gnarNIeI_M0cFxjNYdAA
LOSTARK_MO=UCKXFBKdsV-DEOXBBefYT74wㅜ