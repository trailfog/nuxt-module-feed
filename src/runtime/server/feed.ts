import type { H3Event } from 'h3'
// @ts-ignore
import { defineEventHandler, setHeader, useNitroApp } from '#imports'
import { Feed } from 'feed'
// @ts-ignore
import feedOptions from '#feed'
import type { SourceOptions, FeedType } from '../../types'

function resolveContentType(type: FeedType) {
  const lookup = {
    rss2: 'application/rss+xml',
    atom1: 'application/atom+xml',
    json1: 'application/json'
  }

  return lookup[type]
}

async function createFeed(options: SourceOptions): Promise<string> {
  const feed = new Feed({
    id: '',
    title: '',
    copyright: '',
  })

  await useNitroApp().hooks.callHook('feed:generate', { feed, options })

  return feed[options.type]()
}

export default defineEventHandler(async (event: H3Event) => {
  const options = (feedOptions as Record<string, SourceOptions>)[event.node.req.url as string]
  const contentType = resolveContentType(options.type);
  setHeader(event, 'content-type',  + `${contentType}; charset=UTF-8`)
  setHeader(event, 'cache-control', `max-age=${options.cacheTime}`)
  const feed = await createFeed(options)
  return feed
})