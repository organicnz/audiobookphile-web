import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Preview,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { Markdown } from '@react-email/markdown';
import * as React from 'react';

interface MarkdownEmailProps {
  subject: string;
  markdownContent: string;
}

export default function MarkdownEmail({
  subject,
  markdownContent,
}: MarkdownEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                background: '#121212',
                foreground: '#F5F5F7',
                charcoal: '#1C1C1E',
                'deep-plum': '#2C1A30',
                'muted-gold': '#D4AF37',
                'off-white': '#F5F5F7',
                border: 'rgba(255, 255, 255, 0.08)',
              },
            },
          },
        }}
      >
        <Body className="bg-background font-sans m-0 p-0 text-foreground">
          <Container className="bg-charcoal my-10 mx-auto p-0 rounded-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden max-w-[600px]">
            <Section className="bg-background py-8 px-6 text-center border-b border-border">
              <Heading className="text-muted-gold text-3xl font-semibold m-0 tracking-tight">Aficionado</Heading>
            </Section>

            <Section className="py-10 px-8">
              <Markdown
                markdownCustomStyles={{
                  h1: { fontSize: '24px', fontWeight: 'bold', color: '#F5F5F7', margin: '0 0 16px' },
                  h2: { fontSize: '20px', fontWeight: 'bold', color: '#F5F5F7', margin: '0 0 16px' },
                  h3: { fontSize: '18px', fontWeight: 'bold', color: '#F5F5F7', margin: '0 0 16px' },
                  p: { fontSize: '16px', lineHeight: '26px', color: '#A0A0A5', margin: '0 0 24px' },
                  li: { fontSize: '16px', lineHeight: '26px', color: '#A0A0A5' },
                  link: { color: '#D4AF37', textDecoration: 'underline' },
                  codeInline: { color: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '2px 4px', borderRadius: '4px' },
                }}
              >
                {markdownContent}
              </Markdown>
            </Section>

            <Section className="bg-background py-6 px-8 border-t border-border text-center">
              <Text className="text-[12px] leading-[18px] text-[#A0A0A5] m-0">
                © 2026 Aficionado. All rights reserved.<br />
                <Link href="https://aficionado.fans" className="text-[#A0A0A5] underline">
                  aficionado.fans
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
