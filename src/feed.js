import Parser from 'rss-parser';
import dotenv from 'dotenv';
import timeDifference from './helpers';
import { getFeedUrlsFromNotion } from './notion';

dotenv.config();

const { RUN_FREQUENCY } = process.env;

async function getNewFeedItemsFrom(feedUrl) {
  const parser = new Parser();
  let rss;
  try {
    rss = await parser.parseURL(feedUrl);
  } catch (error) {
    console.error(error);
    return [];
  }
  const currentTime = new Date().getTime() / 1000;

  return rss.items;
  // // Filter out items that fall in the run frequency range
  // return rss.items.filter((item) => {
  //   const blogPublishedTime = new Date(item.pubDate).getTime() / 1000;
  //   const { diffInSeconds } = timeDifference(currentTime, blogPublishedTime);
  //   return diffInSeconds < RUN_FREQUENCY;
  // });
}

export default async function getNewFeedItems() {
  let allNewFeedItems = [];

  const feeds = await getFeedUrlsFromNotion();

  for (let i = 0; i < feeds.length; i++) {
    const { title, feedUrl } = feeds[i];
    console.log(`\n\n***\nStarting feed "${title}": `);
    const feedItems = await getNewFeedItemsFrom(feedUrl);
    console.log('Feeds received: ', feedItems?.length);

    allNewFeedItems = [...allNewFeedItems, ...feedItems];
  }

  // sort feed items by published date
  allNewFeedItems.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));

  return allNewFeedItems;
}
