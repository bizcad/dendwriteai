# Why you need a second brain Part 2
## Transcript
0:00
There are four principles that separate
0:02
people who successfully build AI systems
0:04
from people who get stuck and then just
0:06
give up. And I didn't learn these from a
0:08
textbook. And I'm also not making them
0:09
up. I learned them last week from
0:12
watching dozens of people build the same
0:14
system in completely different ways. So
0:16
last week I posted a video about
0:18
building a second brain without any code
0:20
at all. And it got a lot of traction.
0:22
But what happened next was much more
0:24
interesting than the video itself
0:25
because it taught me how building
0:27
actually works in 2026. People took the
0:31
broad strokes, the architecture I
0:32
described, and they implemented it in
0:34
lots and lots of different tools,
0:36
including tools I never recommended. So
0:38
that meant they hit lots of interesting
0:39
walls. They got around those walls
0:41
interesting ways, and they ended up
0:43
using AI not just inside the system, as
0:45
I suggested, but also to build the
0:47
system. So today I want to dig into that
0:50
story and I want to specifically call
0:51
out four building principles that
0:55
emerged from watching the community go
0:57
through dozens and dozens of builds over
0:59
the last week. And here's the frame I
1:01
want you to hold on through all of this.
1:03
The second brain that's just a project.
1:06
What we learned building it is about how
1:09
complex AI systems get constructed today
1:12
in a world where you have AI as a
1:14
collaborator and peer building
1:16
communities end up functioning as
1:18
pattern libraries. So let's start with
1:20
the principles. First architecture is
1:23
portable tools are not. So when I
1:26
started with this project, when I laid
1:28
out the video, I mentioned a specific
1:30
stack. I talked about notion for storage
1:33
and Zapier for automation and claude or
1:34
chat GPT for intelligence. And I
1:37
mentioned the different jobs that these
1:39
tools do. I talked about how you have to
1:41
have something that's kind of a Dropbox,
1:43
something that sort of lets you put
1:45
things away, something that sorts,
1:48
something that acts to structure data.
1:50
And I went through the different
1:51
principles. Now people were able to take
1:54
those principles and build on them with
1:57
any kind of tool. The tools could be
1:59
very very interchangeable and the
2:01
architecture itself stayed very stable
2:03
across all of those tools. So one
2:05
community member built their system
2:07
using Discord Obsidian and Mac Whisper.
2:10
So Mac Whisper is a tool that
2:11
transcribes audio locally on your Mac
2:13
and Discord is really the capture point
2:15
that replaces Slack. And they set up a
2:17
Discord server with like a special
2:19
structure and added timed prompts. They
2:21
really sort of built it out. So they
2:24
used very different tools, but they came
2:26
from the same principles. You can see
Principle 1: Architecture is portable, tools are not
2:29
the capture point. You can see the
2:30
sorting that happens. You can see the
2:32
intelligence layer. The implementation
2:34
details may be unrecognizable. Like they
2:37
connected Mac Whisper to automatically
2:39
process their Zoom recordings, send
2:41
transcripts to Obsidian, and then they
2:43
run a slash command that processes and
2:44
files everything by project. Super cool.
2:47
Definitely not something in the original
2:49
build plan, but something that follows
2:51
the arc, the structure where you're
2:53
actually trying to process from a
2:55
capture point and store it and then make
2:58
sure that you can retrieve it in an
2:59
intelligent way later. And this just
3:01
underlines how important it is to think
3:05
about architecture consistently in the
3:07
age of AI. You can end up in a place if
3:09
you have a good architecture where you
3:11
have a completely different tool stack.
3:13
I did not suggest using Mac Whisper and
3:16
Obsidian, but it still works because the
3:18
architecture hold. And so the
3:20
implication here is that when you're
3:22
learning to build with AI, don't
3:24
necessarily memorize the tools. Learn
3:27
the patterns. The tools will shift.
3:29
Zapier might not be the right choice for
3:31
you. Maybe notion might not fit your
3:33
workflow, but the patterns, the idea of
3:36
how the second brain is constructed,
3:38
that it needs a place to drop ideas,
3:39
that's clean, it needs a way to sort
3:41
ideas, etc., Those are sticky patterns.
3:44
Those are steady. Once you understand
3:47
them, you can implement them anywhere.
3:49
The second of the four principles that I
3:50
want to call out is that when you're
3:52
working with AI, principlesbased
3:54
guidance scales way better than
3:57
rules-based guidance. And this goes for
3:59
whether you're coaching or whether
4:00
you're teaching or frankly whether
4:02
you're trying to learn for yourself. So,
4:04
one community member ended up building
4:06
their system using Claude's computer use
4:08
capability combined with Obsidian and a
4:10
custom TypeScript agent. And so, they
4:12
had a custom agent running on a VPS,
4:15
which is just a virtual server in the
4:16
cloud. And they had remote access so
Principle 2: Principles-based guidance scales better than rules
4:18
they can connect to it from anywhere.
4:20
And then here's the part that caught my
4:21
attention. They wrote an architectural
4:23
best practices doc that guides the
4:25
coding agent through fixes when things
4:27
go wrong. But instead of hard- coding
4:30
specific rules, they were smart. And so
4:32
they said, "Let's write principles.
4:34
Let's write use testdriven development
4:36
or use dependency injection. Don't
4:39
swallow errors." They essentially tried
4:41
to give the agent smart software
4:43
development principles so the agent
4:45
could interpret those principles rather
4:47
than following rigid rules. And this
4:49
matters because AI systems are very good
4:52
at applying judgment in context. They're
4:54
not just pattern matchers executing if
4:56
then rules. We know that, right? When
4:58
you give AI a principle like don't
5:01
swallow errors, it can figure out what
5:03
that means in a hundred different
5:05
situations that you did not anticipate.
5:07
And when you give it a rigid rules like
Writing principles for agents that build AI systems
5:09
always log errors to this specific file,
5:12
you're kind of limiting it to do only
5:14
that one thing, which sometimes you need
5:16
to do, but if you're trying to build
5:18
with AI, it's often more useful to go
5:20
with the principle-based approach. And
5:22
so the implication for building is
5:23
really interesting. When you're writing
5:25
prompts to build, you're effectively
5:27
creating guidelines for AI systems. And
5:29
when you're designing workflows that AI
5:31
will execute, it often makes sense to
5:33
have AI lean toward principles that
5:35
scale rather than just writing rules.
5:38
Unless you have a very, very
5:39
deterministic workflow you're trying to
5:41
encode. So give the AI room to exercise
5:43
judgment where that makes sense. You'll
5:46
get more robust systems that handle edge
5:48
cases you didn't think of. I also want
5:50
to call out a meta layer that is really
5:51
interesting. This build required writing
5:55
principles for an agent to build a
5:58
second brain system that itself used AI.
6:01
There's a metab pattern here that I've
6:04
seen over and over again in successful
6:06
2026 builds. People who are leveraging
6:08
AI to build their AI tooling are going
6:11
much, much, much faster. And it's
6:13
another example of how principles can
6:15
scale because if you can write an agent
6:17
that builds your second brain for you
6:19
and your agent relies on good software
6:22
design principles like don't swallow
6:25
errors, use testdriven development,
6:27
separate your concerns, you're going to
6:29
be able to reuse that build agent other
6:32
places. Principlesbased guidance scales
6:34
in lots of different ways. It's a
6:35
fractal principle. It helps us remember
6:37
things better. It helps us build
6:38
directly better. It also helps us build
6:41
agents that can build more than one
6:43
thing like a second brain and then
6:45
something else. So that's the second
6:46
principle. The third is that if the
6:48
agent builds it, the agent can maintain
6:50
it. One of the most ambitious community
6:52
builds came from someone who created
6:54
what they called a meta agent framework.
6:56
Instead of wiring up individual tools,
6:59
they built an agent that coordinates
7:00
between Claude Code, Codeex, Copilot,
7:03
and Goose, which are all different AI
7:05
coding assistants. They implemented
7:07
what's called a writer critic loop for
7:08
reliability where one agent produces
7:11
output and another agent validates it
7:13
catching errors before they propagate.
7:14
The agent can then set up a cloud
7:16
infrastructure automatically. It can
7:18
generate user interfaces on demand. This
7:21
is much more than just a second break.
7:23
And the insight that really stuck with
Principle 3: If the agent builds it, the agent can maintain it
7:25
me is that they said their goal was to
7:28
enable the agent to set up the
7:29
infrastructure rather than doing it
7:31
themselves. Because if the agent sets it
7:33
up, the agent understands it, which
7:35
means the agent can self-correct and
7:37
self-heal long after you've forgotten
7:38
how the system works. This ends up being
7:41
more like a second brain for an engineer
7:43
who's coding a lot than like a
7:44
traditional second brain build. But by
7:47
having the agent construct it, you have
7:49
agent maintainability, which is going to
7:51
be, I think, a big theme in 2026. So
7:54
think about what this means. If I build
7:56
something myself, I understand it when I
7:58
am building it. But six months later, I
8:01
have to pick up a lot of context to get
8:03
back into it. Anyone who has worked with
8:04
engineers or built something themselves,
8:06
there's something called switching cost.
8:08
You have to get back into the mindset
8:10
and understand the codebase before you
8:13
can make meaningful changes. It is
8:14
non-trivial time and it doesn't look
8:17
productive because you're just trying to
8:18
recover your memory. the configuration
8:21
details, the edge cases you handled, the
8:23
reasons you made certain choices, all of
8:25
that fades away. When an agent builds
8:27
something with you and you keep that
8:29
conversation context, you keep the
8:30
artifacts that you created together, the
8:33
agent can come back and return to debug
8:35
and extend and maintain the system. And
8:38
if you've prepared the memory
8:40
environment correctly, you can
8:41
reinstantiate the agent. You can
8:43
reinvoke the agent with all of the
8:45
memories associated with that particular
8:47
build and it's fresh. There's no context
8:49
switching. The documentation ends up
8:52
being the build process itself. And you
8:55
can re reinvigorate that. You can re
8:57
bring it back to life like you're
8:59
bringing back a vampire to life in an
9:01
old be movie. And the agent will just
9:03
continue to go and do its work. The
9:05
implication is that when you're building
9:07
with AI, consider involving the AI in
9:10
the construction process, not just the
9:12
execution. And I would go farther than
9:14
that. I would say you're not just really
9:15
considering in 2026. You should be
9:17
defaulting to trying to involve AI in
9:20
the construction process. Let it help
9:22
you set things up. Keep the conversation
9:24
going. When something breaks in 6
9:27
months, you can come back to that
9:28
conversation. The AI will help you pick
9:30
up the context you've lost. Even if
9:32
you're a non-coder, this has never been
9:34
easier because Claude launched co-work
9:36
this past week and co-work can hook into
9:39
the Claude extension in Chrome and you
9:41
can just ask claude coowwork please work
Agent maintainability will be a big theme in 2026
9:44
with my Chrome instance and it will use
9:46
your browser and build stuff. People
9:48
were doing that as well as part of their
9:51
build process for this second brain in
9:53
the Substack chat. The fourth principle
9:54
is that your system can be
9:56
infrastructure not just a tool. Now,
9:59
most people who built the second brain
10:01
did treat it as a personal productivity
10:02
tool. That was the original intent after
10:04
all. You capture thoughts, you file
10:06
them, you get digests, etc. But at least
10:08
one community member saw something a bit
10:10
different. They built a hybrid database
10:13
approach using Postgress for structured
10:15
data combined with a vector database for
10:17
semantic search. So, a vector DB lets
10:19
you search for meaning rather than exact
10:21
keywords. So, you can ask something like
10:23
what did I capture about customer
10:25
onboarding? and you find relevant
10:27
entries even if they don't contain any
10:29
of the exact words like customer
Principle 4: Your system can be infrastructure, not a tool
10:30
onboarding. Then they built an API
10:33
endpoint that lets other applications
10:35
query their second brain which is super
10:37
cool and they're working toward a
10:39
reusable software development kit or SDK
10:41
basically a toolkit that other
10:42
developers can use so they can connect
10:44
any application to their personal
10:46
knowledge base. This is someone who saw
10:49
that the second brain is not really just
10:51
a personal productivity tool, but it can
10:53
be a piece of infrastructure that they
10:55
can build other tools and systems on top
10:57
of. I think that this shows the kind of
11:00
higher level systems thinking that we
11:02
need a lot more of to build compounding
11:05
advantage in 2026. There's another piece
11:07
of the story from a different build that
11:10
illustrates the same principle. Another
11:12
builder went deep with cudrant for
11:14
vector search which is sounds really
11:16
technical. is a bit of a technical build
11:17
here, right? They use Neo4j for graphing
11:20
relationships and Postgress as the
11:22
central system of record. If that sounds
11:24
complicated, it's not an easy build.
11:26
It's a it's definitely intermediate to
11:28
advanced. They have multiple claude
11:30
agents coordinating with a layer they
11:31
call a skills plus evidence layer where
11:34
generated content comes with built-in
11:36
receipts showing what sources informed
11:38
each output across this entire system.
11:40
This is definitely not a non-technical
11:43
build. It's a technical build. It's an
11:45
engineering build, but it demonstrates
11:47
that you can take the same architectural
11:49
patterns and they will scale from simple
11:52
to very sophisticated and the principles
11:54
will not break. The other thing I will
11:56
call out is the engineering skills that
11:59
are added here enable you to do and
Higher level systems thinking for compounding advantage
12:02
realize larger pieces of work. And so if
12:05
you want to think about the second brain
12:07
or any software project you're
12:08
contemplating in a broader lens, if you
12:11
want to say this is not just a personal
12:13
productivity tool, this is a piece of
12:14
infrastructure, I want to do something
12:15
bigger with it. The more you're able to
12:18
scale your technical skills, the farther
12:20
you're going to be able to take that
12:21
vision. And this is one of the things I
12:24
keep emphasizing that is is
12:25
counterintuitive. Technical skills have
12:28
tremendous value in 2026. Don't listen
12:30
to people who say that engineering is
12:32
dead. engineers over the last week have
12:35
been able to do much much more
12:37
interesting things with their projects
12:39
because they can use AI to go farther
12:41
because they have the technical domain
12:43
knowledge to know where to push AI to
12:46
help them build. Now, if you're trying
12:48
to learn technical skills, it's never
12:50
been easier. You can learn them with AI
12:54
more easily than you ever could
12:56
previously. You can get custom AI coding
12:59
instructions delivered to you every
13:02
morning in chat GPT if you set a
13:04
scheduled task. I do that every morning.
13:05
It's super easy and there's lots of
13:07
other ways you can do it. There's lots
13:08
of demos you can be a part of. You're
13:10
not short of ways to learn technical
13:12
skills if you want to and they're worth
13:14
it. But zooming back to the broader
13:15
implication, if you are building
13:17
something, you should be asking yourself
13:19
whether it's a tool or infrastructure. A
13:22
tool is going to solve a problem.
13:23
Infrastructure enables others to build
13:26
on top of the solution that you've
13:28
constructed. So if you design with
13:30
infrastructure in mind, you create much
13:32
much more leverage than if you're just
13:33
building a personal productivity tool.
13:35
And I think that that kind of systems
13:37
thinking is going to be more and more
13:38
valuable in 2026 as we're looking to hit
13:42
another layer of abstraction as humans
13:44
managing systems of agents. Like your
13:47
second brain can power a daily digest
13:49
and that's super helpful. But if you are
13:51
using it to power the rest of your
13:53
entire workflow and system, your meeting
13:55
prep, your email drafts, your project
13:57
planning, if you're using it to power an
13:59
entire sort of chief of staff operation
14:01
workflow, well, that initial investment
14:03
pays much more dividends. And yes,
Technical skills still have tremendous value
14:05
you're going to have to have more
14:06
technical skills to go after it, but
14:09
it'll be worth it. And if you're
14:10
wondering if you can get more details on
14:12
these builds, I absolutely wrote up a
14:14
summary of community builds um that I'm
14:16
going to be sticking in the substack as
14:18
well so that you can kind of dive in and
14:20
understand a bit more of it. Now, let me
14:21
add one more build that illustrates
14:22
something different. One community
14:24
member went super minimalist. They're
14:26
using Notion's mobile export feature as
14:28
their capture mechanism. So, they're not
14:30
using Slack. They capture thoughts on
14:32
their phone, export to Notion, and
14:34
Claude just processes their inbox on
14:36
schedule and sorts everything into an
14:37
outbox. The whole system is essentially
14:40
just an inbox outbox with AI processing
14:43
in between. No Zapier, no automation
14:45
chain, just notion and a scheduled cloud
14:48
call. You can do another version of
14:49
simple with uh YAML files which are just
14:52
declarative files that uh developers
14:54
like to use to talk about business
14:56
rules. Another builder swapped out
14:58
notion entirely for local YAML files.
15:01
YAML is just a simple text format for
15:03
storing structured data. And they kept
15:05
Slack as the capture layer because
15:06
they're in Slack all day anyway and it's
15:08
frictionless from their phone. But
15:09
instead of using Zapier as the
15:11
automation layer, they use Claude code
15:13
which lets you have a conversation with
15:14
Claude while it reads and writes files
15:16
to the computer. The key difference is
15:18
that their system is sessionbased rather
15:21
than always on which is what they
15:23
preferred. And so when you sit down to
15:25
work, you spin up a cloud code session
15:27
that processes your inbox, runs the
15:29
classification, writes to local YAML
15:31
files, and then gives you a fix button
15:33
in that same conversation. Look, the
15:35
point is not that you copy these builds,
15:37
right? These different builds illustrate
15:39
that you don't necessarily need
15:41
complexity to get the benefits. You
15:43
might be a non-engineer and say, "Oh,
15:44
it's simpler to use notion in out." Or
15:46
an engineer and say, "I just want to do
15:48
YAML files." But regardless, you can
15:51
start very simple and the principles
15:53
still work. The architecture supports
15:55
something that simple as well as
15:57
something as complex as some of the
The minimalist builds: Notion mobile and YAML files
15:58
builds I discussed earlier in the video.
16:00
Now, here's the pattern that emerged
16:02
that I think represents something
16:03
genuinely new about how building works
16:06
in 2026. And I want to spend some time
16:08
on this because I think it's the most
16:09
important thing I learned from watching
16:11
the community. The people who got their
16:13
systems working fastest were not the
16:16
ones who followed my tutorial the most
16:18
carefully. Instead, they were the ones
16:20
who combined community knowledge with AI
16:23
collaboration. They would hit an
16:24
obstacle. They would post in the
16:26
Substack chat. They would get a pointer
16:27
from someone who'd solved a similar
16:29
problem and then work with Claude or
16:30
chat GPT to implement the fix in their
16:32
own context. One community member posted
16:35
that she built the entire system in two
16:37
hours by just having Claude do it in the
16:39
browser for her. and she gave the
16:41
architecture document to Claude and said
16:43
just solve it. She'd already read
16:45
through the community discussion. She
16:47
had some idea of what to do and she just
16:49
said go do it. This is the new model.
16:51
Community ends up providing a pattern
16:53
library for us to understand where
16:55
common obstacles emerge. And AI ends up
16:57
giving us implementation muscles so we
16:59
can do other things while builds happen.
17:02
Our job is to provide the context and
17:04
the judgment about what applies in our
17:06
specific situation. And our job is
17:08
frankly to provide the intent to say
17:10
this is how I want to express these
17:12
larger principles or this larger
17:13
architecture in a way that works for me.
17:15
I want to define what works for me as a
17:17
second brain, not what works for you.
17:18
Everyone's individual and different.
17:20
That's part of what made this such a
17:21
cool project is that you get to see the
17:24
wide variety of different solutions
17:26
people implement. This is why SAS tools
17:30
for second brains are so hard to build.
17:33
Everyone's brain is different. And the
17:35
beauty of architecture is you can build
17:37
your own second brain the way you like
17:38
it. The tutorial alone will not adapt to
17:41
all of the tools that are your favorites
17:43
and it doesn't need to. And frankly,
17:45
even the AI alone will not know what
17:47
other problems people have already
17:49
solved. The community is going to be
17:52
critical for you to be able to be
17:56
successful building long-term. And I
17:57
don't mean my community in particular.
17:59
The Substack community is wonderful. But
18:02
you find your build community that works
18:04
for you. Having a community that has a
The new pattern: community plus AI collaboration
18:06
pattern library is super useful because
18:10
it can supercharge your ability to
18:13
acquire context and strategically
18:15
allocate that context with your AI to
18:17
build faster. And that's what I saw this
18:19
week. Now, let me give you a quick tour
18:21
of what the Zapier automation actually
18:23
looks like when it's built. I got lots
18:25
of requests for this, so I'm excited to
18:27
show this to you. So, the flow starts
18:28
with a Slack trigger. When a new message
18:30
is posted to your SB inbox channel,
18:32
Zapier captures it and then the trigger
18:34
gives you access to the message text,
18:37
the channel ID, all the details. The
18:39
message text then goes directly to
18:41
Claude via an API call. You can see that
18:44
right here. The anthropic action in
18:46
Zapier sends you a classification prompt
18:49
along with the raw message. And the
18:51
prompt is going to specify the JSON,
18:53
schema, and tell Claude to classify into
18:55
one of four categories and ask for
18:56
confidence score, which I talked about
18:58
in the last video. After Claude
19:00
responds, a code by Zapier right here in
19:03
step three cleans up the response. This
19:05
step removes any markdown formatting. It
19:07
parses the JSON and it flattens the
19:09
nested structure you get from the LLM
19:11
into a field that's super easy to
19:13
reference in later steps. If Claude is
19:15
going to return something that's
19:16
malformed or incorrect, this code step
19:19
can handle it gracefully. Next, we have
19:21
to route. So, split into paths. A path
19:23
step will check the destination field
19:25
from the parsed response. If it's
19:27
people, the flow goes down the people
19:28
path. You get the idea. Each path does a
19:31
few things. First, it creates a record.
19:33
It creates a record in the appropriate
19:35
notion database based on the routing
19:37
that you've done in the previous split.
19:39
So, now we're in the people database,
19:40
and it can split and create that notion
19:42
record. Then, it creates an entry in the
19:45
inbox log with the original text where
19:47
it was filed, the confidence score, and
19:49
the Slack thread. This is the receipt I
19:50
talked a lot about in the original
19:52
video. Finally, it send a Slack message
19:55
back to let you know that it processed
19:57
all of that. And so a Slack message
19:58
might look like filed as people Sarah
20:01
Chen confidence87 reply fix if I got it
20:04
wrong. Now that's how it works for
20:06
people and for projects and for ideas
20:09
and for admin. The needs review path is
20:11
a little bit different. Instead of
20:13
filing to a destination database, it
20:15
logs the item with a needs review status
20:18
over here and sends a Slack reply that
20:21
asks for clarification. It says
Community as pattern library, AI as implementation muscle
20:23
something like, "I couldn't confidently
20:25
classify this. Can you repost it with a
20:27
prefix like person or project?" That's
20:29
really the complete flow. You have one
20:32
trigger at the top up here, one AI call,
20:36
and now you're starting to parse it, and
20:37
then you're starting to run different
20:39
parallel paths.
20:41
You can do this other places. I've also
20:43
seen this built out in NADN. I've seen
20:45
it built out in make. Again, the
20:47
principle is what matters, not the tool.
20:50
Just as a bonus here, I want to share a
20:52
couple of things that emerged from the
20:54
community that are not so much relevant
20:55
to the larger all AI projects in 2026
20:58
conversation, but are super relevant to
21:01
how we think about these tools in the
21:02
second brain work project specifically.
21:05
First, Zapier has limitations that
21:07
become apparent at scale. It was
21:09
designed as an easy entry point. It does
21:11
that well, but it has trouble handling
21:14
larger loops. It doesn't branch and
21:16
recon converge for more complex
21:17
workflows, and so it doesn't work if
21:20
you're trying to do more advanced work.
21:21
Second, the storage backend matters less
21:24
than you might think. A lot of people
21:26
are using Notion, they're using
21:27
Obsidian, they're using YAML files. I
21:29
laid out some of that. If you have an
21:31
existing system that has a storage
21:33
bucket, that's probably good enough.
21:35
Third, if you're building a second
21:36
brain, capture interfaces really should
21:39
just be where you already live. If
21:40
you're in Slack, then do it in Slack.
Zapier automation walkthrough
21:42
Discord works. Google Chat works.
21:45
Frankly, you can probably rig this up
21:46
with text messages. The fourth one
21:48
that's a lesson for second brain
21:50
builders is there's an emerging split
21:52
between sessions-based and always on
21:54
approaches. So, the Zapier flow I showed
21:56
is is designed to be always on. That's
21:58
the way my brain works anyway. Messages
22:01
get processed automatically whether
22:02
you're engaged with them or not. Uh the
22:04
clawed code approach I talked about
22:06
earlier is sessionbased. You process
22:08
your inbox when you sit down to work in
22:10
conversation with the AI. It doesn't
22:12
pre-process for you. Both patterns are
22:14
fine. Always on is better if you're
22:16
really wanting to offload the mental
22:17
load. Sessionbased gives you much more
22:20
control and the ability to ask questions
22:22
during processing and shape that. Again,
22:24
this is why second brain
22:26
one-sizefits-all solutions don't work.
22:27
You have to decide what works for you.
22:29
Finally, and this is where things get
22:31
interesting, there's movement toward AI
22:33
agent generated interfaces. Instead of
22:35
building a fixed dashboard in notion and
22:37
hoping it will serve your needs forever,
22:39
some builders are generating UI on
22:42
demand. I think we're going to see more
22:43
of this in 2026. And so when they need a
22:46
particular view of the data, they ask
22:47
Claude to just create it. I found myself
22:49
doing this on a different application in
22:51
Claude Co-work just this week. So I can
22:53
see that this is going to be a pattern
22:54
that starts to emerge. Let me close with
22:56
a reflection on how this all reshapes my
23:00
own thinking on second brain building
23:02
and how AI is shaping what we as a
23:05
species build and do in the coming year.
23:07
The second brain was just the project,
23:09
but the way we built it revealed that we
23:12
are changing build patterns we've held
23:13
steady for a long, long time. As I
23:16
shared in my previous video, we've had
23:17
the same cognitive architecture for
23:19
about half a million years. We've had a
23:21
few items in working memory, terrible
23:23
retrieval, etc. The second brain was
23:25
designed to really help with that.
23:26
What's different in 2026, what I learned
23:29
as I started to build with the community
23:30
is that the combination of community
23:32
plus AI is really changing the economics
23:36
of building. Community creates a shared
23:38
pattern library that evolves in real
23:40
time. Community helps us figure out a
23:42
better way to handle a confidence
23:44
threshold to get around an obstacle and
23:46
everybody benefits quickly. And AI is
23:48
what provides the implementation muscle
23:50
to adapt all of these community patterns
23:52
to fit our particular context. The gap
23:55
between I understand what someone else
23:57
did and I can do the equivalent used to
23:59
be where a lot of projects went to die.
24:01
And now AI can help us bridge that gap.
24:03
You no longer need to be an engineer to
24:05
construct sophisticated systems. And I'm
24:07
beginning to think the more important
24:09
thing is not to be an engineer, but to
24:12
have a community and to have access to
24:14
an AI you're willing to push because you
24:16
can acquire the technical skills you
24:18
need alone. This community proved that
24:20
principles are portable. People can
24:22
build in any tool they want. You can
24:24
build in Discord and Obsidian wherever
24:25
you are that doesn't matter. What
24:27
matters is that you are able to
24:29
understand what works for you, how you
24:31
want to scale build principles, and how
Routing paths and the needs review flow
24:33
you want to use AI to build more
24:35
quickly. And that to me feels like a
24:38
really big extension from the original
24:40
idea I had in the video because in the
24:42
video I was like the second brain
24:43
itself, the tool itself is a big deal.
24:46
And that's still true. But the build
24:49
pattern we're seeing is an even bigger
24:50
deal because it means that we can take
24:53
this practice of building in community
24:55
using AI to leverage and accelerate our
24:57
builds being really flexible with the
24:59
tools so they fit what we need and we
25:01
can build faster than we've ever built
25:03
before. For so long, building has been
25:05
top down. Building has been you get an
25:07
instruction from someone at work or you
25:09
try a weekend project and you have to
25:10
plan it out and you have to do every
25:12
single line yourself. It's how we built
How the complete flow works together
25:14
the pyramids and it's how we built
25:16
software for a long time. It hasn't
25:17
changed in a long time. Just like our
25:19
cognitive architecture. That's not true
25:21
anymore. Now we have the ability to very
25:25
rapidly digest, meld, and understand the
25:29
best of the build communities around us.
25:32
And we can implement it quickly because
25:34
AI is getting good enough to provide
25:36
real implementation muscle. We have
25:38
build superpowers we have never had
25:40
before and that are not technically
25:42
gated and that makes 2026 a really
25:45
exciting year to be a builder. So I hope
25:47
you enjoyed this tour through how the
25:49
community just tore through the second
25:50
brain built lots of different things. I
25:52
love it. It's a great community. Just a
25:54
little plug. It's not it's not great
25:55
because of me. It's great because of the
25:56
community. And I hope you go and build
25:58
something fun. It doesn't have to be
26:00
second brain. Use AI. Find a community.
26:02
Doesn't have to be mine. And have fun.
##Four principles that separate successful AI builders

